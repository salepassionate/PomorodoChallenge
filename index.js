const Pomorodo = require('./Pomorodo');
const {readAnyFile,writeAnyFile} = require("./filehandler");
const {spawn} = require('child_process');
const fs = require("fs");

const os = require('os');
const readline = require('readline');


const r1 = readline.createInterface({

	input: process.stdin,
	output:process.stdout
});

const loadDefaultValues = () => {
		try{
		
			const jsonData = JSON.parse(fs.readFileSync('defaultValues.json','utf8'));
			return jsonData;
		} catch(err) {
		    return null;
		
		}
		
}

function askForInput(prompt,defaultValue,callback) {

	let attempts = 0;
	
	const ask =  () => {
		r1.question(`${prompt}, (default: ${defaultValue})`,(input) => {

		if(input  === '') {

			callback(defaultValue);
			return;

		}
		const value = parseInt(input, 10);

		if(!isNaN(value) && value > 0) {
			callback(value);
		}
		else {
			attempts++;
			if(attempts < 3) {
				console.log('Invalid Input, please enter a positive number');
				ask();
			}
			else {
				console.log(`Using default value: ${defaultValue}`);
				callback(defaultValue);
			}
		}
	});


	}
    ask();
}

const openHistory = () => {
	const platform = os.platform();
	const filename = "sessionHistory.txt";
	let editor;
        if(fs.existsSync(filename)) {
        	if(platform === 'win32') {
        		editor = 'notepad';	
        		
        	}
        	else if(platform == 'linux') {
        		editor = 'nano';
        	}
		const nano =spawn(`${editor}`,[filename],{stdio:'inherit'});
					

	}
	else {
		console.log("No Saved session yet!!");
	}

}
const menu = () => {
     console.log(`
    commands :
     1 ---> start
     2 ---> stop
     3 ---> pause
     4 ---> resume 
     5 ---> setting
     6 ---> reset
     7 ---> to read past session
     8 ---> to clear the terminal 
     99 ---> exit
 `.blue);
     
}
const logo = () => {
console.log(`
+ --------------------------------------------------- +
|                                                     |
|  __   __   _  _   __   __  __  ___   __             |
| |__| |__| / \\/ \\ |__| |   |__| _|_| |__|            | 
| |                                                   |
|                         _   _   _                   |
+ -----------------------/-\\ |_| |_| ----------------+
	                     |   | 
	                     
  Type "help" to see commands!!	                     
	                     `.blue);
}

const  main = () => {
	logo();
	let pomo = new Pomorodo(workduration,shortbreakduration,longbreakduration,numberofworksession,logo);
	
	r1.on('line',(input) => {

		switch(input.trim()) {
			case '1':
				console.clear();
				logo();
				pomo.start();
				break;
			case '2':
				pomo.stop();
				break;
			case '99':
				pomo.stop();
				pomo.saveSessionHistory();
				setTimeout(()=>{r1.close()},1000);
				break;
			case '3':
				pomo.pause();
				break;
			case '4':
				pomo.resume();
				break;
			case '5':
				pomo.stop();
		        	console.log('Custom values:');
				let workdefaultValue = workduration;
			 	let shortbreakdefaultValue = shortbreakduration;
			 	let longbreakdefaultValue  = longbreakduration;
			 	let worksessiondefaultValue = numberofworksession;

			 	askForInput('Enter work duration (in minutes)',workdefaultValue,(wduration) => {
					askForInput("Enter short break (in minutes)",shortbreakdefaultValue,(sbreak) => {
						askForInput("Enter long break duration (in  minutes)",longbreakdefaultValue, (lbreak) => {
						     askForInput("Enter work interval (positive number)", worksessiondefaultValue, (wsession) => {
							
							numberofworksession = wsession;
							workduration = wduration;
							shortbreakduration = sbreak
							longbreakduration = lbreak;			
							
							const newDefault = {
								'workduration':workduration,
								'shortbreakduration':shortbreakduration,
								'longbreakduration': longbreakduration,
								'numberofworksession':numberofworksession
							};
							writeAnyFile('defaultValues.json',newDefault,isJson=true,(result) => {
							            const message = result?'Error Saving to file!!':'Saved!!'
							            pomo.notice(message);
								
							});
							
							pomo.notice(`
						Work Durattion: ${workduration} minutes
						Short Break: ${shortbreakduration} minutes
						Long Break: ${longbreakduration} minutes
						Work Interval: ${numberofworksession}	
							`);
							console.clear();
							logo();
							pomo = new Pomorodo(workduration,shortbreakduration,longbreakduration,numberofworksession,logo);
							
						     });
						});
					});
				}); 
				break;
			case '6':
				console.clear();
				logo();
				pomo.reset();
				break;
			case '7':
				openHistory();
				break;

			case '8':
				console.clear();
				logo();
				pomo.getCurrentPrompt();
				break;
			case 'help':
				menu();
				break;
			default:
				console.log('invalid command')
						
		}
	});
	r1.on('close', () => {
		console.log('Exiting Pomorodo!!')
		process.exit(0);
	});

	r1.on('SIGINT', () => {
		pomo.pause();
		r1.question("Do you want to Exit From Pomodoro (yes/no)",(answer) => 	{
		if(answer.trim().toLowerCase() === 'yes') {
			pomo.stop();
			pomo.saveSessionHistory();
			setTimeout(()=>{r1.close()},1000);
		}
		else {
			pomo.resume();
		}
		});

	});
}

const defaultValues = loadDefaultValues();
let workduration = defaultValues? defaultValues.workduration:25;
let shortbreakduration = defaultValues?defaultValues.shortbreakduration:5;
let longbreakduration = defaultValues?defaultValues.longbreakduration:15;
let numberofworksession = defaultValues?defaultValues.numberofworksession: 4;

main()
