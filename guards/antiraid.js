module.exports = (client) => {

client.on("guildMemberAdd",(member)=>{

const age = Date.now() - member.user.createdTimestamp;

const oneDay = 1000*60*60*24;

if(age < oneDay){

member.kick("Anti Raid - New Account");

}

});

};