const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { checkComplaintAccess } = require('../controllers/complaintsController');
const complaintsController = require('../controllers/complaintsController');
const chatController = require('../controllers/chatController');
const { compileTelecomRequisition } = require('./telecomRequisition');
const { compileSyndicateDocket } = require('./syndicateConsolidator');
const { generateSection65BAffidavit } = require('./section65bGenerator');
const Complaint = require('../models/Complaint');

describe('Security, RBAC & Legal Accuracy Audit Regression Tests', () => {
  const citizenA_Id = new mongoose.Types.ObjectId();
  const citizenB_Id = new mongoose.Types.ObjectId();
  const officerA_Id = new mongoose.Types.ObjectId();
  const officerB_Id = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();

  const userA = { _id: citizenA_Id, role: 'user', name: 'Citizen Alice' };
  const userB = { _id: citizenB_Id, role: 'user', name: 'Citizen Bob' };
  const officerA = { _id: officerA_Id, role: 'officer', name: 'Inspector Ananya' };
  const officerB = { _id: officerB_Id, role: 'officer', name: 'Inspector Vikram' };
  const adminUser = { _id: adminId, role: 'admin', name: 'Super Admin' };

  const caseOwnedByA = {
    _id: new mongoose.Types.ObjectId(),
    complaintId: 'CMP-2026-0001',
    userId: citizenA_Id,
    assignedTo: officerA_Id,
    status: 'investigating'
  };

  const caseUnassigned = {
    _id: new mongoose.Types.ObjectId(),
    complaintId: 'CMP-2026-0002',
    userId: citizenA_Id,
    assignedTo: null,
    status: 'pending'
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. Unified Access Control (checkComplaintAccess)', () => {
    test('grants admin access to any case', () => {
      expect(checkComplaintAccess(caseOwnedByA, adminUser)).toBe(true);
    });

    test('grants owner citizen access to their own case', () => {
      expect(checkComplaintAccess(caseOwnedByA, userA)).toBe(true);
    });

    test('rejects citizen attempting to access another citizen case (IDOR prevention)', () => {
      expect(checkComplaintAccess(caseOwnedByA, userB)).toBe(false);
    });

    test('rejects citizen attempting to perform officer-only action on their own case', () => {
      expect(checkComplaintAccess(caseOwnedByA, userA, { requireOfficer: true })).toBe(false);
    });

    test('grants assigned officer access to case', () => {
      expect(checkComplaintAccess(caseOwnedByA, officerA)).toBe(true);
      expect(checkComplaintAccess(caseOwnedByA, officerA, { requireOfficer: true })).toBe(true);
    });

    test('grants officer access to unassigned case in jurisdiction', () => {
      expect(checkComplaintAccess(caseUnassigned, officerB)).toBe(true);
      expect(checkComplaintAccess(caseUnassigned, officerB, { requireOfficer: true })).toBe(true);
    });

    test('rejects officer attempting to access or modify case assigned to a different officer', () => {
      expect(checkComplaintAccess(caseOwnedByA, officerB)).toBe(false);
      expect(checkComplaintAccess(caseOwnedByA, officerB, { requireOfficer: true })).toBe(false);
    });
  });

  describe('2. Endpoint IDOR & RBAC Protection', () => {
    test('getRestitutionStatus rejects unauthorized citizen with 403 AppError', async () => {
      const mockReq = {
        params: { id: caseOwnedByA._id.toString() },
        user: userB
      };
      const mockRes = {};
      let caughtError = null;
      const mockNext = (err) => { caughtError = err; };

      const selectMock = { select: jest.fn().mockResolvedValue(caseOwnedByA) };
      jest.spyOn(Complaint, 'findById').mockReturnValue(selectMock);

      await complaintsController.getRestitutionStatus(mockReq, mockRes, mockNext);

      expect(caughtError).toBeTruthy();
      expect(caughtError.statusCode).toBe(403);
      expect(caughtError.message).toContain('Not authorized');
    });

    test('generateRestitutionPetition rejects unauthorized citizen with 403 AppError', async () => {
      const mockReq = {
        params: { id: caseOwnedByA._id.toString() },
        user: userB
      };
      const mockRes = {};
      let caughtError = null;
      const mockNext = (err) => { caughtError = err; };

      const popMock = { populate: jest.fn().mockResolvedValue(caseOwnedByA) };
      jest.spyOn(Complaint, 'findOne').mockReturnValue(popMock);

      await complaintsController.generateRestitutionPetition(mockReq, mockRes, mockNext);

      expect(caughtError).toBeTruthy();
      expect(caughtError.statusCode).toBe(403);
      expect(caughtError.message).toContain('Not authorized');
    });

    test('getMoneyTrail rejects unauthorized citizen with 403 AppError', async () => {
      const mockReq = {
        params: { id: caseOwnedByA._id.toString() },
        user: userB
      };
      const mockRes = {};
      let caughtError = null;
      const mockNext = (err) => { caughtError = err; };

      jest.spyOn(Complaint, 'findOne').mockResolvedValue(caseOwnedByA);

      await complaintsController.getMoneyTrail(mockReq, mockRes, mockNext);

      expect(caughtError).toBeTruthy();
      expect(caughtError.statusCode).toBe(403);
      expect(caughtError.message).toContain('Not authorized');
    });

    test('chatController.sendMessage rejects non-owner and unassigned officer with 403 AppError', async () => {
      const mockReq = {
        params: { complaintId: caseOwnedByA._id.toString() },
        user: userB,
        body: { content: 'Unauthorized message attempt' }
      };
      const mockRes = {};
      let caughtError = null;
      const mockNext = (err) => { caughtError = err; };

      jest.spyOn(Complaint, 'findOne').mockResolvedValue(caseOwnedByA);

      await chatController.sendMessage(mockReq, mockRes, mockNext);

      expect(caughtError).toBeTruthy();
      expect(caughtError.statusCode).toBe(403);
      expect(caughtError.message).toContain('Not authorized to send messages');
    });

    test('batchEnforcement rejects officer when target complaints are assigned to others', async () => {
      const mockReq = {
        body: {
          complaintIds: [caseOwnedByA._id.toString()],
          actionType: 'BATCH_STATUS_UPDATE'
        },
        user: officerB // Not assigned to caseOwnedByA
      };
      const mockRes = {};
      let caughtError = null;
      const mockNext = (err) => { caughtError = err; };

      jest.spyOn(Complaint, 'find').mockResolvedValue([caseOwnedByA]);

      await complaintsController.batchEnforcement(mockReq, mockRes, mockNext);

      expect(caughtError).toBeTruthy();
      expect(caughtError.statusCode).toBe(403);
      expect(caughtError.message).toContain('outside your jurisdiction/assignment');
    });
  });

  describe('3. Statutory Citations & Legal Integrity Verification', () => {
    test('telecomRequisition preserves 24-month CDR under DoT Unified License 39.20 & Sec 67C IT Act, not Rule 414', () => {
      const req = compileTelecomRequisition({
        phone: '9845012345',
        officerName: 'Inspector Ananya',
        officerBadge: 'CYBER-KA-001'
      });

      expect(req.directiveText).not.toContain('Rule 414 Indian Telegraph Rules');
      expect(req.directiveText).toContain('DoT Unified License Condition 39.20');
      expect(req.directiveText).toContain('Section 67C of the Information Technology Act, 2000');
      expect(req.directiveText).toContain('PROPOSED TELECOM REQUISITION DRAFT');
      expect(req.directiveText).toContain('LEGAL DISCLAIMER & NOTICE');
    });

    test('syndicateConsolidator correctly characterizes Sec 107 BNSS as attachment of proceeds and labels output as draft assessment', () => {
      const docket = compileSyndicateDocket({
        syndicateId: 'SYN-TEST-01',
        complaints: [
          {
            complaintId: 'CMP-2026-9901',
            amountLost: 50000,
            victimDetails: { name: 'Sunil Verma' },
            location: { city: 'Bengaluru', state: 'Karnataka' },
            ocrData: { extracted: { phones: ['9880055443'] } }
          }
        ]
      });

      const sec107 = docket.statutorySections.find(s => s.section === 'Section 107');
      expect(sec107).toBeDefined();
      expect(sec107.description).toContain('Attachment, Forfeiture or Restoration of Property (Proceeds of Crime)');

      const sec246 = docket.statutorySections.find(s => s.section === 'Section 246');
      expect(sec246).toBeDefined();
      expect(sec246.description).toContain('Joint Trial of Accused Persons');

      expect(docket.executiveSummary).toContain('POTENTIAL SYNDICATE ASSESSMENT DOSSIER DRAFT');
      expect(docket.executiveSummary).toContain('LEGAL NOTICE & DISCLAIMER');
    });

    test('section65bGenerator labels output as draft certificate under BSA Sec 63 with legal disclaimer', () => {
      const result = generateSection65BAffidavit({
        complaintId: 'CMP-2026-8801',
        deponentName: 'Dr. Ramesh Kumar',
        deponentDesignation: 'Complainant & Lawful Custodian',
        deviceDetails: { makeModel: 'Google Pixel 8 Pro', osVersion: 'Android 15' },
        exhibits: [
          { exhibitId: 'EX-P1', filename: 'bank_sms.png', sha256: 'abc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' }
        ]
      });

      expect(result.affidavitText).toContain('SECTION 63(4) OF THE BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023');
      expect(result.affidavitText).toContain('ELECTRONIC RECORD CERTIFICATE DRAFT');
      expect(result.affidavitText).toContain('LEGAL NOTICE & STATUTORY DISCLAIMER');
    });

    test('server.js auth rate limiter contains no email bypasses', () => {
      const serverPath = path.join(__dirname, '../server.js');
      const serverCode = fs.readFileSync(serverPath, 'utf8');

      expect(serverCode).not.toContain('whitelistedEmails');
      expect(serverCode).not.toContain('pruthvishetty04@gmail.com');
      expect(serverCode).not.toContain('admin@cybercrime.gov');
    });

    test('addSupplementaryEvidence controller attaches files under ISO/IEC 27037 custody', async () => {
      const mockComplaint = {
        _id: new mongoose.Types.ObjectId(),
        complaintId: 'CMP-2026-SUPP',
        userId: citizenA_Id,
        assignedTo: officerA_Id,
        status: 'investigating',
        evidence: [],
        chainOfCustody: [],
        timeline: [],
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Complaint, 'findById').mockResolvedValue(mockComplaint);

      const os = require('os');
      const tmpFile = path.join(os.tmpdir(), `test-supp-${Date.now()}.pdf`);
      fs.writeFileSync(tmpFile, '%PDF-1.4\nSupplementary Bank Statement PDF Content');

      try {
        const fakeFile = {
          filename: 'evidence-test.pdf',
          originalname: 'statement.pdf',
          mimetype: 'application/pdf',
          size: 45,
          path: tmpFile
        };

        const req = {
          params: { id: mockComplaint._id.toString() },
          user: userA,
          files: [fakeFile]
        };

        let resStatus = null;
        let resData = null;
        const res = {
          status: jest.fn().mockImplementation((code) => {
            resStatus = code;
            return {
              json: jest.fn().mockImplementation((payload) => {
                resData = payload;
                return payload;
              })
            };
          })
        };
        const next = jest.fn();

        await complaintsController.addSupplementaryEvidence(req, res, next);

        expect(resStatus).toBe(200);
        expect(resData.status).toBe('success');
        expect(mockComplaint.evidence.length).toBe(1);
        expect(mockComplaint.evidence[0].sha256).toBeDefined();
        expect(mockComplaint.evidence[0].sha256.length).toBe(64);
        expect(mockComplaint.chainOfCustody.length).toBe(1);
        expect(mockComplaint.chainOfCustody[0].action).toBe('SUPPLEMENTARY_EVIDENCE_ATTACHED');
        expect(mockComplaint.timeline.length).toBe(1);
        expect(mockComplaint.timeline[0].message).toContain('ISO/IEC 27037 custody');
        expect(mockComplaint.save).toHaveBeenCalled();
      } finally {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      }
    });

    test('addSupplementaryEvidence enforces access control and rejects unauthorized user', async () => {
      const mockComplaint = {
        _id: new mongoose.Types.ObjectId(),
        complaintId: 'CMP-2026-SUPP2',
        userId: citizenA_Id,
        assignedTo: officerA_Id,
        status: 'investigating'
      };

      jest.spyOn(Complaint, 'findById').mockResolvedValue(mockComplaint);

      const req = {
        params: { id: mockComplaint._id.toString() },
        user: userB, // unauthorized user
        files: [{ filename: 'test.png' }]
      };

      const res = {};
      const next = jest.fn();

      await complaintsController.addSupplementaryEvidence(req, res, next);
      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
    });
  });
});
