const fs = require('fs');
const notifier = require("node-notifier");
const colors = require("colors");

class Pomorodo {
    
    constructor(workduration,shortbreakduration,longbreakduration,worksession,callback) {
    
    	this.workduration = workduration * 60;   //convert minutes to second
    	this.shortbreakduration =  shortbreakduration * 60;    //convert minutes to second
    	this.longbreakduration = longbreakduration * 60 ;      //convert minutes to second
    	this.worksession = worksession;   //number of competed work to reset
    	this.callback = callback;        //loading pomorodo logo
    	this.timeRemaining = this.workduration;     
    	this.timerId = null;
    	this.isPaused = false
    	this.isRunning = false;
    	this.workSessionCount = 1;   // number of completed work counter
    	this.intervalType = "work"; // work, short break, long break
    	this.intervalStartingPrompt = "Starting work Interval"; // work, break starting
    	this.intervalEndingPrompt = "Work Interval Complete";   //work,break ending
	    this.total_work_time = 0;
	    this.total_short_break_time = 0;
	    this.total_long_break_time = 0;
	    this.total_work_session = 1;
	    console.log(`${this.intervalType}:${this.minSecFormat(this.timeRemaining)}`);
	    	 
    }
    getCurrentPrompt() {
         if(!this.isRunning) {
    	 	console.log(`${this.intervalType}:${this.minSecFormat(this.timeRemaining)}`);
    	        	
    	 }
    	 
    }
    resetTerminal() {
    		// clear the terminal and print pomorodo logo as well as intervaltype
    		//
    		console.clear();
    		this.callback();
    		let replacewith = `${this.intervalType}:${this.minSecFormat(this.timeRemaining)}`;
       		replacewith = replacewith + "".padEnd(10," ");
       		process.stdout.write(`${replacewith}\r`);
    }
    reset() {
    	if(this.isRunning) {
    		this.stop();
    			
    	}
  
    	this.timeRemaining = this.workduration;
    	this.notice("The timer is reseted!!");
    	this.resetTerminal();
    	console.log(`${this.intervalType}:${this.minSecFormat(this.workduration)}`);
    	return;
    }
    stop() {
    	if(!this.isRunning) {
    		//this.notice("the timer is already stopped!!");
    		this.resetTerminal();
    		return;
    	}
    
    	clearInterval(this.timerId);
    	this.isRunning = false;
    	this.resetTerminal();
    	
    }
    
    pause() {
    
    		if(this.isRunning) {
    		      if(this.isPaused) {
    		      	     //this.notice("Timer is already paused");
    		      	     this.resetTerminal();
    		      	     return;
    		      }
    		      
    		      clearInterval(this.timerId);
    		      this.isPaused = true;
    		      //this.isRunning = false;
    		      this.notice("The Timer is paused!!");
    		      this.resetTerminal();
    		     
    		}
    		else {
    			this.notice("start the timer first!!");
    			this.resetTerminal();
    		}
    		
    		
    }
    resume()  {
        
        if(this.isRunning) {
        	if(this.isPaused) {
         		this.isPaused = false;
         		this.stop();
         		this.start();
         	}
         	else {
         		this.notice("pause the timer first!!");
 
         	}
        }
    	else {
    		this.notice("Start the timer first!!")
    	}
    	this.resetTerminal();
    }
    
    start() {
    	
    
    	 if(!this.isRunning) {
    		this.isPaused = false;
    		this.isRunning = true;
       		this.notice(`${this.intervalStartingPrompt}`);
       		this.timerId = setInterval(() => {
       			this.timeRemaining--;
       			let replacewith = `${this.intervalType}:${this.minSecFormat(this.timeRemaining)}`;
       			replacewith = replacewith + "".padEnd(10," ");
       			process.stdout.write(`${replacewith}\r`);
       			if(this.timeRemaining <= 0){
       				clearInterval(this.timerId);
       				this.isRunning = false;
       				this.notice(`${this.intervalEndingPrompt}`);
       				this.checkcycle();
       			}
       },1000);
              
      }
      else {
      		
      		this.notice("The Timer is already started!!");
      		return;		
      } 
      
      
    }
    checkcycle() {
   
    	this.isRunning = false;
    	if(this.workSessionCount === this.worksession) {
			this.total_work_time += this.workduration;
    		this.timeRemaining = this.longbreakduration;
    		this.intervalType = "Long break";
    		this.intervalStartingPrompt = "Starting Long Break";
    		this.intervalEndingPrompt = "Long Break Complete";
    		this.workSessionCount = 0;
    		this.total_long_break_time += this.longbreakduration - this.timRemaining;
    	}
    	else {
    	        if(this.intervalType.toLowerCase() === 'short break' || this.intervalType.toLowerCase() === 'long break') {
    	        	this.workSessionCount++;
    	        	this.timeRemaining = this.workduration;
    			this.intervalType = "work";
    			this.intervalStartingPrompt = "Starting Work Interval";
    			this.intervalEndingPrompt = "Work interval complete";
    			this.total_work_time += this.workduration - this.timeRemaining;
    			this.total_work_session += 1;
    	        }
    	        else {
					this.total_work_time += this.workduration;
    			this.timeRemaining = this.shortbreakduration;
    			this.intervalType= "Short Break";
    			this.intervalStartingPrompt = "Starting Short Break";
    			this.intervalEndingPrompt = "Short Break Complete";
    			this.total_short_break_time += this.shortbreakduration - this.timeRemaining;
    			
    		}
    	}
    	this.start();
    }
    saveSessionHistory() {
                let intervalType = this.intervalType.trim().toLowerCase();
                
    	        if(intervalType === "work") {
    	        	this.total_work_time += this.workduration - this.timeRemaining;
					//this.total_short_break_time += this.shortbreakduration
					//this.total_long_break_time += this.longbreakduration
    	        }
    	        else if(intervalType === "short break") {
    	        	this.total_short_break_time += this.shortbreakduration - this.timeRemaining;
					//this.total_long_break_time += this.longbreakduration;
					//this.total_work_time += this.workduration
    	        }
    	        else {
    	         	this.total_long_break_time += this.longbreakduration - this.timeRemaining;
					 //this.total_work_time += this.workduration;
					 //this.total_long_break_time += this.longbreakduration;
    	        }
    	        
    		this.stop();
                const content = `
   ${new Date().toDateString()} : 
           Total Work time: ${this.total_work_time} seconds,
           Total break time: ${this.total_short_break_time + this.total_long_break_time} seconds (${this.total_short_break_time} sbreak, ${this.total_long_break_time} lbreak),
           Total work session: ${this.total_work_session} `
           
		fs.appendFile('sessionHistory.txt', content, (err) => {
		
			if(err) {
				
				this.notice(`${error}`);
				return;
			}
			this.notice(`${content}`);
		});
			  
    }
    
    notice(message) {
    		notifier.notify({
    		
    			"title":'Pomorodo',
    			"message": `${message}`,
    			"sound":true,
    			"wait": false,
    		});
    }
    
    minSecFormat(second) {
		let hours = Math.floor(second / 3600);
    	let minutes = Math.floor((second % 3600) /60);
    	let seconds = (second % 60 < 10)? `0${second % 60}`: second % 60 ;
    	
    	if(minutes <= 2) {
    	
    		return `${hours}:${minutes}:${seconds}`.red;
    	 }
    	 return `${hours}:${minutes}:${seconds}`.green;
    	 	
    }
}

module.exports = Pomorodo; 
