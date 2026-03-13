const map = new Map();

module.exports = (client) => {

client.on("messageCreate",(msg)=>{

if(!msg.guild) return;

if(!msg.content.includes("@everyone") && !msg.content.includes("@here")) return;

const now = Date.now();

if(!map.has(msg.author.id)) map.set(msg.author.id,[]);

const timestamps = map.get(msg.author.id);

timestamps.push(now);

const filtered = timestamps.filter(t=> now - t < 5000);

map.set(msg.author.id,filtered);

if(filtered.length >= 4){

msg.member.ban({reason:"Ping Spam Protection"});

}

});

};