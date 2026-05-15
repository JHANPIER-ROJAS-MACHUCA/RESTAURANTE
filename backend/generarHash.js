const bcrypt = require('bcrypt');

(async()=>{

const hash=await bcrypt.hash(
'123456',
12
);

console.log(hash);

})();