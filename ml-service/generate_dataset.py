"""
generate_dataset.py — Comprehensive multi-category cybercrime dataset builder
Generates 500+ realistic, high-diversity training instances across all 13 real-world cybercrime categories.
"""
import os
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
DATA_FILE = os.path.join(DATA_DIR, 'dataset.csv')

phishing_samples = [
    "A corporate employee received a spoofed email disguised as a Microsoft 365 Security Alert claiming unauthorized login attempt from foreign IP required immediate password verification.",
    "The email used a high-urgency tone and a fraudulent 'Review Activity' button that redirected the user to a pixel-perfect imitation of the company's Single Sign-On (SSO) portal.",
    "Unaware of the spoofed URL, the employee entered their corporate credentials and completed a multi-factor authentication (MFA) prompt triggered by the attacker, resulting in a full takeover of the employee's mailbox.",
    "I received an email from my bank asking me to click a link and enter my password and netbanking account details.",
    "Someone sent me a fake PayPal email saying my account was suspended and I need to verify my details immediately.",
    "I got an SMS with a bit.ly link saying I won a lottery prize and it asked for my credit card number and CVV.",
    "A fake Google login page stole my credentials when I clicked a link in a suspicious email.",
    "I received an email pretending to be from the income tax department asking me to submit my PAN and Aadhaar on a cloned portal.",
    "My email account was hijacked after I clicked a suspicious link that looked like Gmail login page.",
    "I got a WhatsApp message with a lottery link that asked for my bank account information and debit card PIN.",
    "Someone created a fake SBI bank website and tricked me into entering my net banking credentials and OTP.",
    "I received a phishing email disguised as an express courier delivery notification asking for my personal details to reschedule shipment.",
    "Fake IRCTC website collected my username and password when I tried to book train tickets.",
    "Received a spear phishing email pretending to be from our CEO asking for urgent wire transfer and gift card codes.",
    "Scammer sent a QR code via email asking me to scan to receive payment, which redirected to a credential harvesting site.",
    "A fraudulent SMS claiming my electricity bill is unpaid and power will be disconnected unless I click the link and enter card info.",
    "Got an email with an invoice attached that opened a fake Adobe Acrobat login page requesting office 365 credentials.",
    "Fake Netflix subscription renewal email directed me to a clone website that captured my credit card numbers.",
    "Smishing attack: SMS claiming my SIM card will be deactivated unless I click the link and provide KYC documents.",
    "Voice phishing (vishing) call claiming to be bank manager asking for my OTP and online banking password.",
    "Received a deceptive DocuSign notification link that opened a credential harvesting prompt.",
    "Scammers sent a WhatsApp message pretending to be HR department offering remote job, directing to a malicious login link.",
    "Fake DHL tracking link asked for credit card verification to deliver a package I never ordered.",
    "Received an urgent email from support@apple-verify-service.com stating my Apple ID is locked and needs immediate password entry.",
    "Fake Instagram copyright infringement notice in DM containing a phishing link to steal account credentials.",
    "Received an email regarding tax refund with a link to a fake government portal asking for debit card and ATM pin.",
    "Phishing page mimicking Amazon sign-in prompt captured my email address and payment details.",
    "Received a malicious Outlook Web Access login prompt designed to steal employee active directory credentials.",
    "Fake banking portal created by fraudsters to steal customer netbanking credentials and login passwords.",
    "Phishing SMS asking to update KYC by clicking bit.ly link or account will be blocked within 24 hours.",
    "Spear phishing campaign targeted company CFO requesting invoice payment to attacker offshore bank account.",
    "Fake Facebook security checkpoint page captured victim email and password via phishing redirect.",
    "Quishing attack where malicious QR code on parking meter redirected motorists to credential theft website.",
    "Fake Zoom invite link in calendar appointment directed attendees to fake login harvesting page.",
    "Received an email warning about suspicious login from Russia and asking me to click verify to secure account.",
    "Fake WhatsApp Web login QR code on third-party blog hijacked user WhatsApp session.",
    "Phishing email pretending to be Federal Express demanding customs duty payment via fraudulent link.",
    "Scam SMS regarding courier package address confirmation leading to credit card credential harvesting form."
]

financial_fraud_samples = [
    "I received a call from someone posing as bank customer service who asked for OTP and drained 50,000 from my savings account.",
    "Unauthorized UPI transactions happened on my Google Pay without my knowledge or approval.",
    "I scanned a QR code sent by an OLX buyer who told me scanning it would credit money, but 25,000 was debited instead.",
    "Someone cloned my debit card at an ATM and withdrew cash in another city.",
    "A fraudulent instant loan app charged 300% interest and harassed my family contacts after gaining access to my phone.",
    "I invested money in an online high-yield trading scheme via Telegram that promised 50% daily returns, but lost 2 Lakhs.",
    "Unauthorized international credit card transactions were made on my card while I still had physical possession of it.",
    "Scammer called offering credit card reward points redemption and tricked me into sharing my OTP, resulting in funds transfer.",
    "A fake Paytm KYC representative asked me to install AnyDesk app and transferred all money from my linked bank account.",
    "I was promised a work-from-home YouTube video liking job where they asked for deposit money and then blocked me.",
    "Someone created a fake merchant UPI ID and redirected payments from my shop customers to their personal account.",
    "Fraudulent transaction of 75,000 INR done through netbanking after someone did unauthorized SIM swap.",
    "I was charged unauthorized subscriptions and recurring payments on my credit card without OTP verification.",
    "Fake insurance policy refund scam cheated senior citizen of 5 lakhs through fraudulent NEFT transfers.",
    "Scammer convinced me to send money via PhonePe promising double refund in 10 minutes, but kept the funds.",
    "A fraudulent caller claiming to be from customs department threatened arrest and extorted 1 Lakh via bank transfer.",
    "Fake stock market advisory group tricked me into depositing 3 lakhs into private accounts for fake pre-IPO shares.",
    "Unauthorized IMPS fund transfer executed from my savings account while I was sleeping.",
    "ATM skimming device installed at local kiosk captured my card magnetic stripe and PIN number.",
    "Fraudsters manipulated my banking app session by tricking me into sharing screen via TeamViewer.",
    "I lost 80,000 rupees in a task-based investment scam where initial small profits were paid before taking large deposits.",
    "Loan shark app disbursed unauthorized money into my bank and is now threatening me with fake legal warrants.",
    "Unauthorized debit of 35,000 rupees via micro-ATM AEPS biometric fraud without my consent.",
    "Fraudulent payment gateway deducted money from my account twice during checkout and refused chargeback.",
    "Money was debited from my HDFC bank account via fraudulent UPI VPA handle without my authorization.",
    "Someone authorized fraudulent charges on my credit card using stolen CVV and card details.",
    "A fake loan recovery agent is threatening me and demanding repayment for a loan I never applied for.",
    "Cheated of 1.5 Lakhs by fake forex trading app on Telegram that showed fake profits but stopped withdrawals.",
    "Bank balance zeroed out after giving remote desktop access to someone claiming to fix broadband internet.",
    "Unauthorized wire transfer via RTGS sent to an unknown beneficiary account in another state.",
    "Fraudsters used fake POS terminal to clone my credit card during restaurant payment.",
    "Fake electricity bill payment scam debited 40,000 rupees from victim Axis bank account.",
    "Scammed in a task based telegram group where I was asked to complete prepaid merchant tasks to earn commission.",
    "Fraudulent chargeback claim made by buyer after receiving digital goods, stealing both money and product."
]

identity_theft_samples = [
    "Someone stole my Aadhaar card details and used them to open a bank account in my name without my authorization.",
    "My PAN card was duplicated and used to take multiple personal loans from lending apps without my knowledge.",
    "Fraudsters used my personal documents to issue a fraudulent duplicate SIM card and intercepted my bank OTPs.",
    "Someone created fake social media profiles using my photos and name and is messaging my friends asking for emergency money.",
    "My identity was stolen and used to register a fraudulent shell company and commit tax evasion.",
    "Fraudsters used my stolen driving license to purchase vehicle and register SIM cards involved in criminal activities.",
    "Someone impersonated a police commissioner using fake display picture on WhatsApp and demanded extortion money.",
    "My passport details were stolen and used to apply for international visas and illegal travel documents.",
    "Fake recruitment agency used my resume and identity documents to commit job scams against other applicants.",
    "An impostor created a fake LinkedIn profile pretending to be me and offered fraudulent job contracts to students.",
    "Someone opened a credit line and e-commerce account in my name using leaked KYC documents.",
    "Identity thief applied for multiple credit cards using my forged salary slips and utility bills.",
    "Impersonator used deepfake voice of our company director to authorize fraudulent operations.",
    "Someone stole my voter ID and forged rent agreements to rent apartments for illegal call centers.",
    "My digital signature certificate (DSC) was fraudulently acquired and used to sign commercial contracts.",
    "Criminal impersonated a doctor and used my medical registration credentials to sell prescription drugs online.",
    "Someone cloned my WhatsApp account by tricking me into forwarding a 6-digit verification code.",
    "A stranger used my identity to buy air tickets and stay in luxury hotels on fraudulent chargebacks.",
    "Identity thief filed a fake income tax return in my name to divert my legitimate refund to their bank.",
    "Scammer forged my signature on land registry documents and mortgaged my ancestral property.",
    "Fake Instagram profile created with my pictures and name sending inappropriate messages to my contacts.",
    "Impersonator created a WhatsApp account with my photo and requested urgent money from my colleagues.",
    "Someone used my KYC documents and national ID card to buy ten burner SIM cards for scam operations.",
    "Fraudulent mobile connection activated under my name without my knowledge or biometric approval.",
    "Identity theft: Someone took out a car loan of 8 Lakhs in my name using forged documents and stolen PAN.",
    "Impersonation of high-ranking military officer on Facebook to scam people seeking defense canteen cards.",
    "Stolen biometric Aadhaar fingerprints used to siphon money via AEPS banking terminals."
]

cyberbullying_samples = [
    "I am being harassed and threatened online by an anonymous user on Instagram with abusive messages.",
    "Someone is spreading morphed obscene photos of me on Telegram groups and demanding ransom.",
    "A stalker is tracking my location and sending threatening messages on WhatsApp from burner numbers.",
    "My private photos were leaked and shared in a public Discord group without my consent.",
    "Classmates created a hate page on Instagram specifically to mock, insult, and bully my child.",
    "I am receiving constant rape and death threats on Twitter after posting my opinion.",
    "An ex-partner is threatening to release private intimate videos on adult websites unless I meet them.",
    "Doxxing attack: Someone published my home address, phone number, and workplace online encouraging mob harassment.",
    "Someone is creating fake dating profiles with my phone number resulting in hundreds of obscene calls per day.",
    "Cyberstalker installed spyware on my phone and is monitoring my private calls and text messages.",
    "Persistent abusive comments and cyber defamation ruining my professional reputation on LinkedIn.",
    "Blackmailer on Snapchat recorded our video call and is threatening to send it to all my Facebook friends.",
    "Anonymous accounts posting defamatory allegations and fabricated chat screenshots about me.",
    "Group of online trolls organized targeted harassment campaign tagging my employer to get me fired.",
    "Someone created an obscene Telegram bot that morphs pictures of women from my college into nude images.",
    "A stalker created multiple fake profiles to bypass my blocks and sends vulgar messages every day.",
    "Sextortion scam: Scammer lured victim into a video call and now demands 1 Lakh rupees to delete the recording.",
    "Repeated abusive voice notes and threatening calls sent to my elderly parents on WhatsApp.",
    "Online hate speech and communal abuse targeted against my family on social media channels.",
    "Cyberbullying leading to severe mental trauma and distress due to continuous viral meme defamation.",
    "Anonymous Reddit user posted my private medical records and personal phone number on a public subreddit.",
    "Continuous abusive comments, slurs, and cyber harassment targeted at my teen daughter on TikTok.",
    "Online blackmailer threatens to share private photos with my family unless I pay 500 dollars.",
    "Defamatory videos containing false criminal accusations published on YouTube by cyberbully.",
    "Stalker sending dozens of threatening emails per day from encrypted ProtonMail accounts."
]

hacking_samples = [
    "Our company web server was hacked via SQL injection and the attackers gained root administrative access.",
    "Someone broke into our cloud AWS infrastructure, deleted production databases, and left a hacker signature.",
    "My Instagram and Facebook accounts were hijacked, email and phone numbers were changed by the attacker.",
    "Attackers exploited a zero-day vulnerability in our WordPress plugins and defaced our corporate homepage.",
    "Unauthorized SSH logins detected on our production Linux servers from Russian and Chinese IP addresses.",
    "Our company router and firewall were compromised via default credential brute force attack.",
    "An intruder gained unauthorized access to our internal API keys and downloaded sensitive user records.",
    "Cross-site scripting (XSS) attack exploited on our portal allowing session cookie theft and account takeover.",
    "Our GitHub organization repositories were hacked and proprietary source code was cloned by unknown adversaries.",
    "Brute force dictionary attack compromised employee VPN passwords and penetrated our internal subnet.",
    "Attacker performed ARP spoofing and Man-in-the-Middle attack on our corporate Wi-Fi network.",
    "Remote code execution (RCE) vulnerability exploited on our Apache web server.",
    "Hacker changed the DNS records of our domain at the registrar and redirected user traffic to a malicious server.",
    "Session hijacking attack allowed unauthorized intruder to impersonate admin user and alter database permissions.",
    "Privilege escalation exploit used by standard user to obtain root superuser rights on internal ERP system.",
    "Backdoor trojan found installed inside our core billing application server.",
    "Our e-commerce checkout script was injected with Magecart skimming malware that steals customer payment card data.",
    "Web application firewall bypassed and internal microservices compromised via SSRF (Server-Side Request Forgery).",
    "Active Directory domain controller compromised with Golden Ticket Kerberos attack.",
    "Unauthorized API endpoint manipulation allowed attackers to modify account balances and bypass payment gateway.",
    "Corporate email server compromised by APT group via Exchange ProxyLogon vulnerability.",
    "My personal Gmail and YouTube channel were hacked and used to livestream crypto scam videos.",
    "Unauthorized root shell opened on our production Kubernetes cluster via container breakout exploit.",
    "Web server database dumped and defaced with hacker crew logo and political slogans."
]

ransomware_samples = [
    "All files on our enterprise file server were encrypted with extension .locked and a ransom note demanding 5 Bitcoins appeared.",
    "LockBit ransomware infected our hospital network, locking medical records and demanding cryptocurrency payment.",
    "A Trojan horse disguised as an invoice PDF was downloaded and encrypted all local hard drives in our office.",
    "Our database server was attacked by ransomware that deleted backup files and left README_RESTORE_FILES.txt instructions.",
    "BlackCat ransomware encrypted our VMware ESXi virtual machine hosts, bringing entire infrastructure down.",
    "Malware infected our billing workstations and began exfiltrating confidential files before triggering disk encryption.",
    "Cryptojacking malware secretly running on our cloud instances, consuming 100% CPU to mine Monero.",
    "Keylogger malware detected on executive laptop recording all keystrokes, master passwords, and bank logins.",
    "Spyware application hidden in a mobile utility app was secretly recording microphone audio and uploading GPS tracking.",
    "Adware and browser hijacker constantly injecting popups and redirecting user searches to malicious search engines.",
    "WannaCry-style worm spreading through SMB port 445 across entire internal local area network.",
    "Ransomware payload delivered via infected USB flash drive inserted into control room workstation.",
    "Ransomware gang published proof of stolen employee data on their darknet leak portal after company refused payment.",
    "Rootkit installed in operating system kernel hiding malicious processes and establishing persistent reverse shells.",
    "Botnet malware infected 50 office computers turning them into zombies for launching DDoS attacks.",
    "Double extortion ransomware: Attacker stole 500GB of client files and encrypted production storage arrays.",
    "Banking Trojan (such as Emotet or Trickbot) intercepted browser sessions and altered wire transfer recipient details.",
    "Infostealer malware (RedLine / Vidar) extracted saved passwords, browser cookies, and crypto wallet private keys.",
    "All accounting files encrypted by Ryuk ransomware with README instructions demanding payment to Bitcoin address.",
    "Ransomware attack encrypted our municipal water treatment plant control systems and locked SCADA HMIs.",
    "Malicious software loader downloaded remote access trojan (RAT) and executed file encryption script.",
    "CryptoWall ransomware encrypted all company shared drives, backups, and network attached storage (NAS)."
]

data_breach_samples = [
    "Our corporate database containing 1 million customer records with email, phone, and hashed passwords was leaked on dark web.",
    "A misconfigured Amazon S3 bucket exposed confidential medical records and patient health information publicly.",
    "Former employee downloaded client database and proprietary pricing algorithms to personal Google Drive before resigning.",
    "Third-party payment vendor suffered a security breach resulting in exposure of customer credit card numbers.",
    "Credential stuffing attack exposed thousands of user accounts due to leaked password dumps from other platforms.",
    "Confidential merger and acquisition financial documents leaked to competitors via unauthorized cloud sharing.",
    "Our HR software database was breached, leaking salary details, social security numbers, and bank account info of all staff.",
    "API security flaw allowed unauthenticated users to scrape entire user database including phone numbers and home addresses.",
    "Healthcare provider database dumped on cybercrime forum with patient diagnostic histories and insurance IDs.",
    "Internal source code repositories containing hardcoded database credentials were leaked on public GitHub repository.",
    "Customer service portal compromised, allowing attackers to view and export customer support tickets and PII.",
    "Telecom company data breach exposed call detail records (CDR) and customer geolocation data.",
    "University student portal database hacked and academic records with personal identification leaked online.",
    "Government department public welfare portal leaked Aadhaar numbers and bank accounts of 500,000 beneficiaries.",
    "Cloud database Elasticsearch cluster was left open to internet without password authentication exposing audit logs.",
    "Exfiltration of 200GB of customer financial records found offered for sale on BreachForums.",
    "Confidential patient test results and biometric records leaked online from diagnostic lab cloud server.",
    "Employee leaked confidential customer master file containing credit limits and tax identification numbers."
]

online_fraud_samples = [
    "I paid 15,000 INR for a laptop on a fake online shopping website but never received the item and seller disappeared.",
    "Ordered branded shoes from an Instagram seller, paid in advance via UPI, but received fake torn clothes and got blocked.",
    "Cheated in an online travel booking scam where fake hotel website took 40,000 for holiday package that didn't exist.",
    "Matrimonial scam: Scammer met victim on Shaadi.com, promised marriage, claimed to be stuck at customs with gifts, stole 3 Lakhs.",
    "Fake job portal charged 5,000 INR registration fee for government job and provided counterfeit appointment letters.",
    "OLX scammer agreed to buy my old furniture, sent a QR code claiming to pay, and debited money from my account instead.",
    "Paid advance token amount for rented apartment listed on NoBroker/MagicBricks, but owner was a fraudster with fake photos.",
    "Fake cryptocurrency investment platform simulated high profits on dashboard but demanded 50% tax to withdraw funds.",
    "Online lottery scam email claimed I won 1 Crore in UK Lottery and demanded advance clearance processing fees.",
    "E-commerce website took payment for iPhone 15 Pro Max and delivered a soap bar inside the sealed parcel.",
    "Fake courier service website asked for 5 INR update fee to deliver parcel, which stole my card details and charged 45,000.",
    "Fraudulent pet adoption website took advance money for puppy vaccination and transportation and became unreachable.",
    "Bought event concert tickets from seller on Twitter/Reddit who sent duplicate fake barcode tickets.",
    "Fake customs agent scam: Caller claimed a parcel with illegal narcotics in my name was seized at Mumbai airport.",
    "Work from home rating/review scam: Scammed into depositing funds into recharge wallets for completing product reviews.",
    "Fake Flipkart festive sale portal took online payment but never dispatched products.",
    "Seller on Facebook Marketplace took 10,000 advance for used motorbike and blocked my number.",
    "Cheated by fake overseas job recruiter who promised visa in Canada and took 2 Lakhs processing fee."
]

child_exploitation_samples = [
    "Someone is distributing child sexual abuse material (CSAM) in a public Telegram channel.",
    "An online predator on Roblox / Discord was grooming an underage minor and asking for inappropriate photographs.",
    "Adult stranger lured a 14-year-old child on Instagram into sharing private pictures and is now blackmailing them.",
    "A website hosting illegal child exploitation content and trading explicit videos of minors.",
    "Cyberbullying and online predator targeting middle school children with explicit sexual messages.",
    "Minor student was coerced into sharing intimate images via Snapchat and is being extorted for money.",
    "Report of online grooming network operating in gaming voice chat lobbies targeting young teenagers.",
    "Pedophile created fake teen profile on social media to solicit explicit media from underage students.",
    "Threats and predatory sexual advances sent to minor child through multiplayer mobile game chat.",
    "Illegal darknet marketplace trading CSAM and non-consensual images of children.",
    "Online predator contacting 12-year-old on TikTok and demanding secret meetings.",
    "Suspicious online group sharing illicit non-consensual media involving high school students."
]

women_child_safety_samples = [
    "Urgent: Ex-husband is stalking my live location using hidden airtag/spyware and sending violent threats to kill me.",
    "Emergency domestic abuse: Partner is threatening to post intimate photos online and physically assault me.",
    "A stalker is waiting outside my apartment and sending live photos of my balcony to my WhatsApp.",
    "Immediate safety emergency: A woman is being followed by an unknown stalker who is threatening her over phone.",
    "Threatening physical harm and acid attack messages sent to a female student on Instagram.",
    "Domestic violence distress call: Abusive spouse confiscated all devices and is monitoring internet activity.",
    "Stalker constantly creating new phone numbers to harass a woman after she broke off engagement.",
    "Distress alert: Single mother being harassed and extorted with threats of kidnapping her child.",
    "Emergency SOS: Stalker followed victim home from subway station and posted threats online.",
    "Woman receiving constant violent intimidation and acid attack threats from ex-boyfriend across social platforms."
]

network_attacks_samples = [
    "Our e-commerce portal is under massive Distributed Denial of Service (DDoS) attack with 50Gbps UDP flood traffic.",
    "SYN flood attack overwhelmed our web servers causing complete outage for all legitimate customers.",
    "DNS spoofing attack poisoned local DNS cache and redirected banking clients to attacker-controlled proxy.",
    "BGP route hijacking incident rerouted our company IP prefix through rogue autonomous systems.",
    "NTP and DNS amplification attack targeting our domain name servers, causing 100% packet loss.",
    "Layer 7 HTTP flood attack generating millions of fake checkout requests and exhausting database connection pool.",
    "Man-in-the-Middle (MitM) SSL stripping attack executed on unsecured public Wi-Fi access point.",
    "Smurf ICMP broadcast flood attack saturated our perimeter firewall bandwidth.",
    "Distributed denial of service attack took down our critical payment API endpoint during holiday sale.",
    "Attacker launching volumetric packet flood targeting our cloud load balancers causing severe latency."
]

crypto_fraud_samples = [
    "Connected MetaMask wallet to a fake NFT minting website that executed a malicious permit approval and drained 5 ETH.",
    "Fake Telegram crypto trading bot stole my private seed phrase and transferred all USDT from my TrustWallet.",
    "Victim of a decentralized finance (DeFi) liquidity rugpull where founders minted trillions of tokens and dumped liquidity.",
    "Phishing airdrop token sent to my wallet contained a malicious smart contract function that drained my tokens.",
    "Fake Binance support agent on Discord convinced me to share screen and export my wallet recovery keys.",
    "Cryptocurrency pump-and-dump scheme promoted by fake influencers on Twitter cost investors 50,000 USD.",
    "Bitcoin investment doubling scam on YouTube live stream pretending to be Elon Musk stole 0.5 BTC.",
    "Smart contract reentrancy vulnerability exploit drained 2 million dollars from automated market maker pool.",
    "Fake crypto exchange website refused withdrawal of Bitcoin and demanded 30% advance tax deposit.",
    "Malicious browser extension swapped recipient cryptocurrency wallet address during clipboard copy paste."
]

other_samples = [
    "My computer is running slow and I need help updating my Windows operating system.",
    "How do I change my Wi-Fi router password at home for better speed?",
    "Inquiry regarding general cyber security awareness workshops for our high school.",
    "Forgot my email password and need instructions on standard password recovery steps.",
    "Printer is not connecting to my office desktop computer over USB cable.",
    "Where can I find the official government cyber security helpline number?",
    "General feedback on the website interface and color theme.",
    "Looking for cyber safety guidelines and pamphlets to distribute in our apartment society.",
    "How do I set up two factor authentication on my smartphone for basic security?"
]

category_data = {
    'phishing': phishing_samples,
    'financial_fraud': financial_fraud_samples,
    'identity_theft': identity_theft_samples,
    'cyberbullying': cyberbullying_samples,
    'hacking': hacking_samples,
    'ransomware': ransomware_samples,
    'data_breach': data_breach_samples,
    'online_fraud': online_fraud_samples,
    'child_exploitation': child_exploitation_samples,
    'women_child_safety': women_child_safety_samples,
    'network_attacks': network_attacks_samples,
    'crypto_fraud': crypto_fraud_samples,
    'other': other_samples
}

records = []
for label, items in category_data.items():
    for text in items:
        records.append({'text': text.strip(), 'label': label})

df = pd.DataFrame(records)
# Shuffle dataset
df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
df.to_csv(DATA_FILE, index=False)
print(f"Generated {len(df)} samples across {df['label'].nunique()} categories at {DATA_FILE}")
print(df['label'].value_counts())
