const fs = require('fs');

const writeAnyFile = (filename,value,isJson = false, callback) => {
	let data = value;
	if(isJson) {
		data = JSON.stringify(data,null,2); // convert data to json 
	}
	fs.writeFile(filename,data,'utf8',(err) => {
		if(err) {
			callback(err); // error writing to file
			return;
		}
		callback(null); //success writing to file
	});
}

const readAnyFile = (filename,callback) => {

	fs.readFile(filename,'utf8',(err,data) => {
			if(err) {
		              return; 		
			}
			callback(data);
	});
	
}

module.exports =  {
	readAnyFile,
	writeAnyFile
};


