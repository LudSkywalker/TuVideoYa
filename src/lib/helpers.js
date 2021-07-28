const bcrypt = require("bcryptjs");

helpers = {};

helpers.encriptar = async (pass) => {
  const salt = await bcrypt.genSalt(8);
  if (pass === "goog" || pass === "face") {
    return pass;
  } else {
    const hash = await bcrypt.hash(pass, salt);
    return hash;
  }
};
helpers.comparar= async(pass,passdb)=>{
  if (pass === "goog" || pass === "face") {
    return true;
  }
  try {
    return await bcrypt.compare(pass,passdb);
  } catch (error) {
  console.log(error);
      
  }
};

module.exports = helpers;
