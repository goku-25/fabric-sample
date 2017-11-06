CREATE TABLE user_detail (
    uid INT PRIMARY KEY AUTO_INCREMENT,
    fname  VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    phone BIGINT(100) NOT NULL,
    email VARCHAR(40) NOT NULL,
    usertype VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20)  NULL
);

CREATE TABLE user_session(
    uid int,
    ID int NOT NULL AUTO_INCREMENT,
    token VARCHAR(12) NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (uid) REFERENCES user_detail(uid)
);


CREATE TABLE verification(
uid int,
otp VARCHAR(20) NOT NULL,
encodedMail VARCHAR(40) NOT NULL,
FOREIGN KEY (uid) REFERENCES user_detail(uid)
);

CREATE TABLE savepolicy(
uid int,
ID int NOT NULL AUTO_INCREMENT,
consignmentWeight BIGINT(100) NOT NULL,
consignmentValue BIGINT(100) NOT NULL,
invoiceNo BIGINT(100) NOT NULL,
modeofTransport VARCHAR(100) NOT NULL,
packingMode VARCHAR(100) NOT NULL,
contractType VARCHAR(100) NOT NULL,
policyType VARCHAR(100) NOT NULL,
consignmentType VARCHAR(100) NOT NULL,
PRIMARY KEY(ID),
FOREIGN KEY (uid) REFERENCES user_detail(uid)
);

CREATE TABLE issuedpolicy(
uid int,
ID int NOT NULL AUTO_INCREMENT,
consignmentWeight BIGINT(100) NOT NULL,
consignmentValue BIGINT(100) NOT NULL,
policyName VARCHAR(100) NOT NULL,
sumInsured BIGINT(100) NOT NULL,
premiumAmount BIGINT(100) NOT NULL,
modeofTransport VARCHAR(100) NOT NULL,
packingMode VARCHAR(100) NOT NULL,
consignmentType VARCHAR(100) NOT NULL,
contractType VARCHAR(100) NOT NULL,
policyType VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
policyHolderName VARCHAR(100) NOT NULL,
userType VARCHAR(100) NOT NULL,
invoiceNo BIGINT(100) NOT NULL,
policyNumber BIGINT(100) NOT NULL,
PRIMARY KEY(ID),
FOREIGN KEY (uid) REFERENCES user_detail(uid)
);

