const { maskPII } = require('./privacyShield');

/**
 * Single source of truth for what a viewer is allowed to see on a complaint.
 * Admin, assigned/unassigned-for-officer, and the owner get the original.
 * Everyone else (Community page browsing) gets a masked, PII-free version.
 */
function buildComplaintForViewer(complaint, viewer) {
    const complaintUserId = complaint.userId._id
        ? complaint.userId._id.toString()
        : complaint.userId.toString();

    const isOwner = complaintUserId === viewer._id.toString();
    const isAdmin = viewer.role === 'admin';

    const assignedToId = complaint.assignedTo
        ? (complaint.assignedTo._id ? complaint.assignedTo._id.toString() : complaint.assignedTo.toString())
        : null;

    const isAssignedOfficer = viewer.role === 'officer' && assignedToId === viewer._id.toString();
    const isUnassignedAndOfficer = viewer.role === 'officer' && !assignedToId;

    const getsOriginal = isOwner || isAdmin || isAssignedOfficer || isUnassignedAndOfficer;

    const base = typeof complaint.toObject === 'function' ? complaint.toObject() : complaint;

    if (getsOriginal) {
        return {
            ...base,
            viewMode: 'original',
        };
    }

    // Masked view: officer viewing someone else's assigned complaint, or any
    // other logged-in user browsing the Community page.
    const maskedTitle = maskPII(complaint.title || '').masked;
    const maskedDescription = maskPII(complaint.description || '').masked;

    return {
        complaintId: complaint.complaintId,
        title: maskedTitle,
        description: maskedDescription,
        category: complaint.category,
        severity: complaint.severity,
        status: complaint.status,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        victimDetails: undefined,
        suspectInfo: undefined,
        location: complaint.location && complaint.location.city
            ? { city: complaint.location.city }
            : undefined,
        viewMode: 'masked',
    };
}

module.exports = { buildComplaintForViewer };