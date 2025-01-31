
const crypto = require('crypto');
const { AUTH_KEY, AUTH_IV } = require('../config/env.config');


const algorithm = "aes-128-cbc";
const authKey = AUTH_KEY;
const authIV = AUTH_IV;

function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(authKey), authIV);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("base64");
  }
  
  function decrypt(text) {
    // let iv = Buffer.from(text.iv, 'hex');
    // let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(authKey),
      authIV
    );
    let decrypted = decipher.update(Buffer.from(text, "base64"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }


function formatDate(date) {
    // Extracting day, month, and year from the date object
    var day = date.getDate();
    var month = date.getMonth() + 1; // Adding 1 because getMonth() returns zero-based index
    var year = date.getFullYear();

    // Padding day and month with leading zeros if needed
    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }

    // Constructing the formatted date string
    var formattedDate = day + '-' + month + '-' + year;
    return formattedDate;
}


function randomStr(len, arr) {
    var ans = "";
    for (var i = len; i > 0; i--) {
      ans += arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
  }
  
  const hodDeptToEmailMap = new Map();
  hodDeptToEmailMap.set('BioTechnology', "hbt@nitj.ac.in")
  hodDeptToEmailMap.set('Chemical Engineering', "hch@nitj.ac.in");
  hodDeptToEmailMap.set('Chemistry',"hcy@nitj.ac.in");
  hodDeptToEmailMap.set('Civil Engineering',"hce@nitj.ac.in");
  hodDeptToEmailMap.set('Computer Science and Engineering',"hcs@nitj.ac.in")
  hodDeptToEmailMap.set('Electrical Engineering',"hee@nitj.ac.in")
  hodDeptToEmailMap.set('Electronics and Communication Engineering',"	hec@nitj.ac.in")
  hodDeptToEmailMap.set('Humanities and Management',"hhm@nitj.ac.in")
  hodDeptToEmailMap.set('Industrial and Production Engineering',"hip@nitj.ac.in")
  hodDeptToEmailMap.set('Information Technology',"hit@nitj.ac.in")
  hodDeptToEmailMap.set('Instrumentation and Control Engineering',"hic@nitj.ac.in")
  hodDeptToEmailMap.set('Mathematics',"hma@nitj.ac.in")
  hodDeptToEmailMap.set('Mechanical Engineering',"hme@nitj.ac.in")
  hodDeptToEmailMap.set('Physics',"hph@nitj.ac.in")
  hodDeptToEmailMap.set('Textile Engineering',"hodtextile@nitj.ac.in")


  const PURPOSE_OF_VISIT_OPTIONS = [
           "Official Work",
          "Workshop",
          "Short Term Course",
          "Conference",
          "Personal",
          "Others"
  ]

  const isPersonalVisit = (reason) => {
   return reason === "Personal";
  }

 

module.exports = {
    formatDate,
    encrypt,
    decrypt,
    randomStr,
     hodDeptToEmailMap,
     PURPOSE_OF_VISIT_OPTIONS,
     isPersonalVisit
}


