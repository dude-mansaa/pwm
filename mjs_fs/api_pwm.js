load('api_gpio.js');
load('api_timer.js');
load('api_file.js');
load('api_rpc.js');
load('api_config.js');
load('api_sys.js');
load('color.js');
let red = 4;
let green = 16;
let blue = 5;
let white = 19;
GPIO.set_mode(red,GPIO.MODE_OUTPUT);
GPIO.set_mode(green,GPIO.MODE_OUTPUT);
GPIO.set_mode(blue,GPIO.MODE_OUTPUT);
GPIO.set_mode(white,GPIO.MODE_OUTPUT);
let l = {"r":0,"g":0,"b":0,"w":0};
let s = JSON.stringify(l);
let n = JSON.parse(s);
let doReset = function(){
	let obj = JSON.parse(File.read('conf9.json'));
	if(obj === null){
		Sys.reboot(0);
	}else{
		obj.wifi.sta.enable = false;
		obj.wifi.ap.enable = true;
		obj.bt.enable = true;
		obj.wifi.sta.ssid = "";
		obj.wifi.sta.pass = "";
		File.write(JSON.stringify(obj),'conf9.json');
		print('Reseting device to factory defaults');
		let set = JSON.parse(s);
		set.r = 255;
		set.g = 255;
		set.b = 255;
		last(set);
		Sys.reboot(0);
	}
};
let r,g,b,w=0;

let RED = {"r":255,"g":0,"b":0};
let BLUE = {"r":0,"g":0,"b":255};
let GREEN = {"r":0,"g":255,"b":0};
let WHITE = {"r":0,"g":0,"b":0};
let yellow = {"r" : 255,"g" : 255,"b" : 0};
let Black = {"r" : 0,"g" : 0,"b" : 0,"w":0};
let col = "red";
let st = 0;

let Initcolor = function(){
	if(Cfg.get('wifi.sta.enable')===true ){
	
		Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {  
		let evs = '???';
		if (ev === Net.STATUS_DISCONNECTED) {
		if(st === 0){
			st = Blinkw();
		}else {
			Timer.del(st);
			st = Blinkw();
		}
		evs = 'DISCONNECTED';
		} else if (ev === Net.STATUS_CONNECTING) {
			if(st === 0){
				st = Blinkw();
			}else {
				Timer.del(st);
				st = Blinkw();
			}
			evs = 'CONNECTING';
		} else if (ev === Net.STATUS_CONNECTED) {
			evs = 'CONNECTED';
		} else if (ev === Net.STATUS_GOT_IP) {
			if(st !== 0){
				Timer.del(st);
			}
			let s = File.read('userData.json');
			let b = JSON.parse(s);
			let res = b.led;
			prevColor = color(prevColor,res);
			evs = 'GOT_IP';	
		}
		print('== Net event:', ev, evs);
	},null);
	return prevColor;
 	}
	if(Cfg.get('bt.enable')===true){
		if(st === 0){
			st = Blinkb();
			Timer.set(60000,false,function(){
				Timer.del(st);
			},null);
		}else {
			Timer.del(st);
			st = Blinkb();
			Timer.set(60000,false,function(){
				Timer.del(st);
			},null);
		}
		return prevColor;
	}
	
};

let Blinkb  = function(){ 
	let i = Timer.set(1500,true,function(){
			if(col === "red"){
				col = "green";
				let val = JSON.stringify(RED);
				let res = JSON.parse(val);
				prevColor = color(prevColor,res);
			}else if(col === "green"){
				col = "blue";
				let val = JSON.stringify(GREEN);
				let res = JSON.parse(val);
				prevColor = color(prevColor,res);
			}else if(col === "blue"){
				col = "red";
				let val = JSON.stringify(BLUE);
				let res = JSON.parse(val);
				prevColor = color(prevColor,res);
			}
	},null);
	return i;
};

/* let Blinkbw  = function(){ 
	let d = Timer.set(1000,true,function(){
			let y = JSON.stringify(yellow);
			let b = JSON.stringify(Black);
			let res = JSON.parse(y);
			let bb = JSON.parse(b);
			prevColor = color(bb,res);
	},null);
	return d;
};
 */
let Blinkw  = function(){ 
	let id = Timer.set(1000,true,function(){
			prevColor = color(prevColor,prevColor);
	},null);
	return id;
};

let last = function(args){
	let s = File.read('userData.json');
	let b = JSON.parse(s);
	b.led.r = args.r;
	b.led.g = args.g;
	b.led.b = args.b;
	File.write(JSON.stringify(b),'userData.json');
};

let GetCurrent = function(){
	let s = File.read('userData.json');
	let b = JSON.parse(s);
	let r = {
			"r": b.led.r,
			"g": b.led.g,
			"b": b.led.b
	};
	return r;
};


let PWM = {
  // ## **`PWM.set(pin, freq, duty)`**
  // Set and control the PWM. `pin` is a GPIO pin number, `freq` is
  // frequency, in Hz. `freq` 0 disables PWM on the pin. `duty` specifies
  // which fraction of the cycle is spent in "1" state: 0 is always off,
  // 0.5 is a square wave, 1 is always on.
  // Return: true - success, false - failure.
  //
  // Example:
  // ```javascript
  // PWM.set(pin, 50, 2.73);
  // ```
  // Note:
  // on ESP32 we use 8 channels and 4 timers.
  // Each `PWM.set()` call with new pin number assigns a new channel.
  // If we already have a timer running at the specified frequency,
  // we use it instead of assigning a new one.
  set: ffi('bool mgos_pwm_set(int, int, float)'),
};
