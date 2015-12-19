/***************************************
/ All 4-way directional arrays go Up, Right, Down, Left //URDL
/ GridSquare variables stored consist of S,G,M,V
/ These stand for Silicon, Gates, Metal, Vias, and Electricity
/ 			S: [baseType, URDL], each being <""|"n"|"p">
			G: [<""|"npn"|"pnp">, <""|"h"|"v">]
			M: [middle, URDL], <0|1>
			V: [is it there], <0|1>
	Electric Current is its own array to keep memory + looping costs low.
			current[x][y]= {"M":<0|1>,           	// Metal on or off // resets each turn
							"S":<0|1>,				// Silicon on or off // resets each turn
							"G":<"d"|"gd"|"gu"|"u">}// Gate down, up, going down, or going up // reset turn after a voltage change
***************************************/
window.Game = {
	"lastSquare":[],
	"chip":{
		"gridSquare":"",
		"size": 32,
		"activeGates":[],
		"width":0,
		"height":0,
		"map":[],
		"selected":[],
		/*  Functions:
				connect(): 		Triggered when you hold the mouse while moving through two zones.
									- Also triggered multiple times by line-drawing mode
				disconnect():	Triggered when you click the mouse in delete mode
				set():     		!!! Depreciated !!!
				unset():   		!!! Depreciated !!!
				draw():    		Triggered (only?) by set() and unset(), pulls from current map[];
				undraw():  		!!! Depreciated !!!
				checkLoc():		Checks that the parameter is a 2-element array within the grid
				getAdj():		Gets all adjacent squares.
				select():		Highlights/Identifies grid spaces
				deselect():		Unhighlights everything.
				addPic():		Triggered by draw()
				rmvPic():		Triggered by draw() and undraw()
				mouseConnect(): Triggered by mouse events created by makeGrid()
				sendCurrent():  Triggered on circuit test.  Recursive.
				
				//addPic() and rmvPic() are simple, repetetive, and complex to type.  They merely show/hide the pictures.  checkLoc() follows the same principle, but is merely a guard statement regarding improper location variables.
				//draw() and undraw() are most likely to change when I redo the graphics.  Actually, it should be the only one that changes at all.
				//set() and unset() should have no direct contact with draw() or undraw()
				//connect() and disconnect() include the rule determination for whether something can or cannot connect, and what happens to stuff around it.
				//set() and unset() in consideration for deletion.  Duties would be picked up by connect() and disconnect()
				//undraw() is in consideration for deletion.  Duties would be picked up by draw() and rmvPic()
				//disconnect() cannot be deleted.  connect() and disconnect() are too complicated to merge.
		*/
		"connect":function(type,a,b,makeLine){
			//Guards//
			//There should always be three parameters
			//B can equal A, or can be one square away in one direction
			//Decisions for Silicon should be placed here, not left for set()
			if (!b){
				console.log("Error: Game.chip.connect(): Needs 3 parameters");
				return false;
			}
			if (!this.checkLoc(a,".connect(a)")){
				return false;
			}
			if (!this.checkLoc(b,".connect(b)")){
				// return false; // temporarily disabled
			}
			/* A has to be greater than B on ocasion
			if (a[0]>b[0]||a[1]>b[1]){
				console.log("Error: Game.chip.connect(): a>b");
				return false;
			}*/
			if ((Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]))>1){
				console.log(a,b);
				console.log("Error: Game.chip.connect(): a and b farther than adjacent");
				return false;
			}
			//console.log(a,b);
			//End Guards//
			var dataA = this.map[a[0]][a[1]];
			var dataB = this.map[b[0]][b[1]];
			switch (type){
				case "N":
					var s1 = "n";
					var s2 = "p";
				case "P":
					var s1 = s1 || "p";
					var s2 = s2 || "n";
					if(dataA["G"][0]||dataA["S"][0]==s2){
						//console.log("Verified: connect(): BROKEN");
						break;
						//All of these things make silicon not work.
						//Gate is on start (instead of end)
						//Start has the opposite color
					}
					dataA["S"][0]=s1;
					if(dataB["G"][0]&&dataB["G"][0][1]==s1){
						dataB["V"] = [0];
						//console.log("Verified: connect(): dataB[\"G\"][0][1] == s1");
						if ((dataB["G"][1]=="h")&&(a[0]==b[0])){
							if(a[1]>b[1]){
								dataB["S"][3] = s1;
								dataA["S"][1] = s1;
							}
							if(a[1]<b[1]){
								dataB["S"][1] = s1;
								dataA["S"][3] = s1
							}
						}
						if ((dataB["G"][1]=="v")&&(a[1]==b[1])){
							if(a[0]>b[0]){
								dataB["S"][2] = s1;
								dataA["S"][4] = s1;
							}
							if(a[0]<b[0]){
								dataB["S"][4] = s1;
								dataA["S"][2] = s1;
							}
						}
						break;
						//If gate already exists, see if this can join the gate
						//s1 Must be same color as top of gate (["G"][0][1])(eg: "npnh"[1]=="p")
						//Must be going in same direction
						//If it can, do not create a new gate.  Do not touch the gate.  Just link to/from it.
					}
					if(dataB["G"][0]){
						break;
					}
					if(dataB["S"][0] == s2){
						//console.log("Verified: connect(): dataB[\"S\"][0] == s2");
						if (dataB["S"].toString() == [s2,"",s2,"",s2].toString() && a[0]==b[0]){
							var adj1 = this.map[b[0]+1][b[1]]["G"];
							var adj2 = this.map[b[0]-1][b[1]]["G"];
							if (adj1[1]=="v" || adj2[1]=="v"){
								// break; // Removing This Rule
							}
							dataB["G"] = [s2+s1+s2,"h"];
							if(a[1]>b[1]){
								dataB["S"][3] = s1;
								dataA["S"][1] = s1;
								dataB["V"] = [0];
							}
							if(a[1]<b[1]){
								dataB["S"][1] = s1;
								dataA["S"][3] = s1;
								dataB["V"] = [0];
							}
						}
						if (dataB["S"].toString() == [s2,s2,"",s2,""].toString() && a[1]==b[1]){
							var adj1 = this.map[b[0]][b[1]+1]["G"];
							var adj2 = this.map[b[0]][b[1]-1]["G"];
							if (adj1[1]=="h" || adj2[1]=="h"){
								// break; // Removing This Rule
							}
							dataB["G"] = [s2+s1+s2,"v"];
							if(a[0]>b[0]){
								dataB["S"][2] = s1;
								dataA["S"][4] = s1;
								dataB["V"] = [0];
							}
							if(a[0]<b[0]){
								dataB["S"][4] = s1;
								dataA["S"][2] = s1;
								dataB["V"] = [0];
							}
						}
						break;
						//If other color is there already but no gate exists, See if Gate can be made.
						//We already know that there is only one color in square, because there is no gate
						//["S"] == [s2,0,s2,0,s2] or [s2,s2,0,s2,0]
						// Removing This Rule //The s2 silicon in that square cannot lead directly to another gate that it's the top of.
					}
					//remainder is if there is no other color in dataB
					//treat like metal, except with s1 instead of 1 and "S" instead of type
					if (a[0]<b[0]){
						dataA["S"][2] = s1;
						dataB["S"][4] = s1;
					}
					if (a[1]<b[1]){
						dataA["S"][3] = s1;
						dataB["S"][1] = s1;
					}
					if (a[0]>b[0]){
						dataA["S"][4] = s1;
						dataB["S"][2] = s1;
					}
					if (a[1]>b[1]){
						dataA["S"][1] = s1;
						dataB["S"][3] = s1;
					}
					dataA["S"][0] = s1;
					dataB["S"][0] = s1;
				break;
				case "M":
					if (a[0]<b[0]){
						dataA[type][2] = 1;
						dataB[type][4] = 1;
					}
					if (a[1]<b[1]){
						dataA[type][3] = 1;
						dataB[type][1] = 1;
					}
					if (a[0]>b[0]){
						dataA[type][4] = 1;
						dataB[type][2] = 1;
					}
					if (a[1]>b[1]){
						dataA[type][1] = 1;
						dataB[type][3] = 1;
					}
					dataA[type][0] = 1;
					dataB[type][0] = 1;
				break;
				case "V":
					dataA[type][0] = dataA["G"][0]?0:1;
					dataB[type][0] = dataB["G"][0]?0:1;
				break;
				case "EM":
				case "ES":
					//temporary type
					this.sendCurrent(a,"god",type[1]);
				break;
				default:
					console.log("Error: Game.chip.connect(): invalid type");
			}
			//No set() or other changers below this switch statement.
			//draw() only displays stuff, not changes it.
			if (type=="N"||type=="P"){
				type="S";
			}
			this.draw(a,type);
			this.draw(b,type);
		},
		"disconnect":function(type,a,b){
			if (!this.checkLoc(a,".disconnect()")){
				return false;
			}
			var x = a[0];
			var y = a[1];
			//b is not used except to call a second disconnect instance.
			if(b){
				if(!this.checkLoc(b,".disconnect(b)")){
					return false;
				}
				this.disconnect(type,b);
			}
			var base = this.map[x][y];
			var adj = this.getAdj(a);
			switch(type){
				case "G":
					//This should only be called from case "S" before the bottom of the gate is cut.
					//This only cuts the top of the gate.
					//Note that this is working off a new base, rather than the old base.
					var s1 = base["S"][0];
					var s2 = s1=="n"?"p":"n";
					for (var i=1;i<5;i++){
						if(adj[i][2] || base["S"][i] != s2){continue};
						base["S"][i] = "";
						adj[i][3]["S"][(i+1)%4+1] = "";
						this.draw(adj[i],"S");
					}
					base["G"] = ["",""];
				break;
				case "S":
					var s1 = base["S"][0];
					if (!s1) {break}; //if there's already no silicon to deal with
					var s2 = s1=="n"?"p":"n";
					this.disconnect("G",a);
					for (var i=1;i<5;i++){
						if(adj[i][2]){ continue; }
						adj[i][3]["S"][(i+1)%4+1] = "";
						this.draw(adj[i],"S");
						if(adj[i][3]["G"][1]==(i%2?"v":"h")){
							console.log("disconnect('S') adjacent",i,"runs",(i%2?"v":"h"));
							//* Can this be taken over by disconnect("G")?
							if(i%2){
								if(adj[i][0] != this.width){
									this.map[adj[i][0]+1][adj[i][1]]["S"][4] = "";
									this.draw([[adj[i][0]+1][adj[i][1]]],"S");
								}
								if(adj[i][0] != 1){
									this.map[adj[i][0]-1][adj[i][1]]["S"][2] = "";
									this.draw([[adj[i][0]-1][adj[i][1]]],"S");
								}
							} else {
								if(adj[i][1] != this.height){
									this.map[adj[i][0]][adj[i][1]+1]["S"][1] = "";
									this.draw([[adj[i][0]][adj[i][1]+1]],"S");
								}
								if(adj[i][1] != 1){
									this.map[adj[i][0]][adj[i][1]-1]["S"][3] = "";
									this.draw([[adj[i][0]][adj[i][1]-1]],"S");
								}
							}//*/
							this.disconnect("G",adj[i]);
						} // if this leads to bottom of gate
						if(adj[i][3]["G"][1]==(i%2?"h":"v")){
							console.log("Leads to top of gate.");
							if(adj[i][3]["S"][i] == ""){
								console.log("Not sustained by other side.",adj[i][3]["S"],i,"on",adj[i][0],adj[i][1]);
								this.disconnect("G",adj[i]);
							} // if the other side isn't sustaining the gate
						} // if this leads to top of gate
						this.draw(adj[i],"S");
						this.draw(adj[i],"G");
					} // for each adjacent square
					base["S"] = ["","","","",""];
				case "V":
					base["V"] = [0];
				break;
				case "M":
					base[type] = [0,0,0,0,0];
					for (var i=1;i<5;i++){
						if(adj[i][2]){ continue; }
						this.map[adj[i][0]][adj[i][1]][type][(i+1)%4+1] = 0;
						this.draw(adj[i],type);
					}
				break;
				default:
			} // end switch (type)
			this.draw(a,type);
			this.draw(a,"S");
			this.draw(a,"G");
		},
		"set":function(){ // Depreciated
			console.log("What the heck is using Game.chip.set()?  This is depreciated");
		},
		"unset":function(){ // Depreciated
			console.log("What the heck is using Game.chip.unset()?  This is depreciated");
		},
		"draw":function(a,key){
			if (!this.checkLoc(a,".draw()")){
				return false;
			}
			var data = this.map[a[0]][a[1]];
			switch(key){
				case "M":
					data = data["M"];
					this.rmvPic(a[0],a[1],".layer_metal img");
					var numb = "m";
					if (!data[0]){
						return;
					}
					for (var i=1;i<5;i++){
						numb += (data[i])?"1":"0";
					}
					this.addPic(a[0],a[1],"img."+numb);
				break;
				case "G":
				case "S":
					var dataS = data["S"];
					if (dataS[0]){
						//N and P Bases//
						var order = ["m","u","r","d","l"];
						console.log
						for (var i in order){
							this[(dataS[i]=="n"?"addPic":"rmvPic")](a[0],a[1],"img.n"+order[i]);
							this[(dataS[i]=="p"?"addPic":"rmvPic")](a[0],a[1],"img.p"+order[i]);
						}
						var dataG = data["G"]
						if (dataG[0]){
							this.addPic(a[0],a[1],"img."+dataG[0]+dataG[1]);
						} else {
							this.rmvPic(a[0],a[1],".layer_gate img");
						}
					} else {	
						this.rmvPic(a[0],a[1],".layer_silicon img");
						this.rmvPic(a[0],a[1],".layer_gate img");
					}
				break;
				case "V":
					this[data["V"][0]?"addPic":"rmvPic"](a[0],a[1],"img.via");
				break;
				case "EM":
				case "ES":
				case "E":
					this[(Game.chip.current[a[0]][a[1]].S || Game.chip.current[a[0]][a[1]].M)?"addPic":"rmvPic"](a[0],a[1],".current_metal");
				break;
				default:
					console.log("Error: Game.chip.draw(): key is not valid:",key);
			}
		},
		"undraw":function(a,key){ // Depreciated
			console.log("What the heck is using Game.chip.undraw()?  This is depreciated");
		},
		"checkLoc":function(a,msg){
			if (!a||!a[0]||!a[1]||a[0]<1||a[1]<1||(a[0]>=Game.chip.map.length)||(a[1]>=Game.chip.map[1].length)){
				if(msg!="silent"){
					msg = "Error: Game.chip" + (msg || ".checkLoc():") + " location error:" + a + a[0] + a[1];
					console.log(msg);
				}
				return false;
			} else {
				return true;
			}
		},
		"getAdj":function(a){
			var x = a[0];
			var y = a[1];
			var adjacent =  ["placeHolder",
							[x,y-1,y==1],
							[x+1,y,x==this.width],
							[x,y+1,y==this.height],
							[x-1,y,x==1]];
			for (var i=1;i<5;i++){
				if(adjacent[i][2]){ continue; }
				adjacent[i][3] = this.map[adjacent[i][0]][adjacent[i][1]];
			}
			return adjacent;
			// i is the direction from a to the adjacent square.
			// (i+1)%4+1 is the direction from the adjacent square to a.
			// baseA[type][i] connects with baseAdj[type][(i+1)%4+1]
			// adj[i] = [x,y,invalid,map]
		},
		"select": function(a){
			if (!this.checkLoc(a,".select()")){
				return false;
			}
			$(".row:nth-child("+a[1]+") .col:nth-child("+a[0]+")").addClass("selected");
			this.selected.push(a);
		},
		"deselect": function(){
			this.selected = [];
			$(".row .col.selected").removeClass("selected");
		},
		"addPic":function(x,y,pic){
			if (pic.indexOf("img")==-1){
				//console.warn("Please include 'img' in the selector parameter for Game.chip.addPic()  To expand functionality, 'img.' is being removed from addPic() and rmvPic()");
			}
			$(".row:nth-child("+y+") .col:nth-child("+x+") "+pic).addClass("active");
		},
		"rmvPic":function(x,y,pic){
			if (pic.indexOf("img")==-1){
				//console.warn("Please include 'img' in the selector parameter for Game.chip.rmvPic()  To expand functionality, 'img.' is being removed from addPic() and rmvPic()");
			}
			$(".row:nth-child("+y+") .col:nth-child("+x+") "+pic).removeClass("active");
		},
		"mouseConnect":function(e){
			var square = [];
			var bx = square[0] = $(e).index()+1;
			var by = square[1] = $(e).parent().index()+1;
			var type = Game.selectors.type;
			var cORd = "connect";
			if (Game.selectors.delete){
				cORd = "disconnect";
				type = (type=="P"||type=="N")?"S":type;
			}
			if(!this.checkLoc(Game.lastSquare,"silent")){
				Game.lastSquare = square;
			}
			var ax = Game.lastSquare[0];
			var ay = Game.lastSquare[1]
			if ((Math.abs(ax-bx)+Math.abs(ay-by))>1){
				if (ay==by&&ax!=bx){
					if (ax<bx){
						for (var x=ax;x<bx;x++){
							Game.chip[cORd](type,[x,ay],[x+1,ay]);
						};
					} else {
						for (var x=ax;x>bx;x--){
							Game.chip[cORd](type,[x,ay],[x-1,ay]);
						};
					}
				}
				if (ax==bx&&ay!=by){
					if (ay<by){
						for (var y=ay;y<by;y++){
							Game.chip[cORd](type,[ax,y],[ax,y+1]);
						};
					} else {
						for (var y=ay;y>by;y--){
							Game.chip[cORd](type,[ax,y],[ax,y-1]);
						}
					}
				}
				if (ax==bx&&ay==by){
					Game.chip[cORd](type,square,square);
				}
				if (ax!=bx&&ay!=by){
					this[cORd](type,square,square);
				}
			} else {
				this[cORd](type,Game.lastSquare,square);
			}
			console.log("Mouse Down over",square,"from",Game.lastSquare);
			Game.lastSquare = square;
			this.deselect();
			this.select(square);
		},
		"sendCurrent":function(a,b,type){
			var type2 = (type=="M")?"S":"M";
			if (type!="S" && type!="M"){
				console.log("Error: Game.chip.sendCurrent(): invalid type",type);
				return;
			}
			if(!this.checkLoc(a,'.sendCurrent(a)')){
				return false;
			}
			var x = a[0];
			var y = a[1];
			if (!this.map[x][y][type][0]){
				return false;
			}
			var baseA = this.map[x][y];
			var curSquare = this.current[x][y];
			if (!baseA[type][0]){
				console.log("Error: Game.chip.sendCurrent(): improper current sent.");
				return;
			}
			var adj = this.getAdj(a);
			if (typeof b == "string"||!this.checkLoc(b,'Game.chip.sendCurrent(b)')){
				if (baseA["G"][0] && type=="S"){
					return false;
				}// if this square has a gate(and the current flows through silicon), you must know an on-the-board source.
			} else {
				var x2 = b[0];
				var y2 = b[1];
				if (Math.abs(x2-x)+Math.abs(y2-y)>1){
					console.log("Error: Game.chip.sendCurrent(): a and b aren't adjacent.");
					return false;
				}
				if (x2==x&&y2==y){
					console.log("Error: Game.chip.sendCurrent(): a and b are the same.");
					return false;
				}
				// End b guards: if there's a b, b should make sense. //
				if (baseA["G"][0] && type=="S"){
					var possible = [false,
									b[1]>a[1],
									b[0]<a[0],
									b[1]<a[1],
									b[0]>a[0] ]
					var dir = possible.indexOf(true);
					if (baseA["S"][dir]==baseA["S"][0]){
						//Silicon is to bottom of gate.
						//If NPN: goes thru if Gate is up or going down (AND)
						//If PNP: goes thru if Gate is down or going up (NOT)
						var status = curSquare["G"];
						if (baseA["G"][0] == "npn"){
							if (status == "u" || status == "gd"){
								this.sendCurrent(adj[dir],a,"S");
							};
						} else {
							if (status == "d" || status == "gu"){
								this.sendCurrent(adj[dir],a,"S");
							};
						}
					} else {
						if (curSquare["G"] == "d" || curSquare["G"] == "gu"){
							curSquare["G"] = "gu";
						} else {
							curSquare["G"] = "u";
						} // if (it was completely down or if it just got switched up) and else
						  // It can't be going up already without a second side of the gate being activated.
						this.activeGates.push([x,y]);
					} // if this silicon is bottom of gate, and else
					return;
				} // If we're powering the gate
			}
			// If there is no gate //
			if (this.current[x][y][type]){
				return true;
			} // Recursion Guard.  Stop the flood at the already-flooded.
			this.current[x][y][type] = 1;
			this.draw(a,"E");
			for (var i=1;i<5;i++){
				if (baseA[type][i]){
					this.sendCurrent(adj[i],a,type);
				}
				if (baseA["V"][0]){
					if (baseA[type2][i]){
						this.sendCurrent(adj[i],a,type2);
					}
				}
			}
		},
		"resetCurrent":function(){
			var cur = Game.chip.current = 
				Array.apply(null, Array(Game.chip.width + 1))
				.map(function(){
					return Array.apply(null, Array(Game.chip.height + 1))
					.map(function(){
						return {"M":0,
								"S":0,
								"G":"d"
								}
					});
				});
			for (var i=0; i<this.activeGates.length; i++){
				var x = this.activeGates[i][0];
				var y = this.activeGates[i][1];
				cur[x][y]["G"] = "gd";
			}
			this.activeGates = [];
			$(".row .col .current_metal").removeClass("active");
			$(".row .col .current_silicon").removeClass("active");
		},
		"makeGrid":function(x,y){
			console.log("Starting to make Grid.  Behind the scenes");
			Game.chip.width=x;
			Game.chip.height=y;
			x++;
			y++;
			//Functional Only//
			var m = this.map = 
				Array.apply(null, Array(x))
				.map(function(){
					return Array.apply(null, Array(y))
					.map(function(){
						return {"M":[0,0,0,0,0],
								"S":["","","","",""],
								"G":["",""],
								"V":[0]
								}
					});
				});
			var c = this.current = 
				Array.apply(null, Array(x))
				.map(function(){
					return Array.apply(null, Array(y))
					.map(function(){
						return {"M":0,
								"S":0,
								"G":"d"
								}
					});
				});
			console.log("Moving onto HTML portion");
			//Appearance Only//
			var row = '<div class="row" unselectable="on">'
			for (var i=1; i<x; i++){
				row += this.gridSquare;
			}
			row += '</div>';
			$("#chip").empty();
			console.log("TimeoutSet!!!");
			var rowsAppended = 1;
			function appendRow(){
				$("#chip").append(row);
				rowsAppended++;
				if (rowsAppended < y){
					setTimeout(appendRow, 10);
				} else {
					console.log(".row .col has ",$(".row .col").length,"entries");
					$(".row .col").mouseenter(function(e){
						if(e.buttons>0){
							Game.chip.mouseConnect(this);
						}
					}).mousedown(function(){
						Game.chip.mouseConnect(this);
					});
					$("#chip").mouseleave(function(){
						Game.lastSquare = [];
					});
					$("input#ax,input#bx").attr("max",x-1);
					$("input#ay,input#by").attr("max",y-1);
					console.log("Finished with HTML portions");
				}
			}
			if (document.styleSheets[1].cssRules[0]){
				document.styleSheets[1].cssRules[0].style.height = (this.size * (y-1)) + "px";
			}
			appendRow();
			chip += '</div>';
			//console.log("Finished with string.  Inserting as HTML");
			//$("#chip").replaceWith(grid);
			//Selections Only//
			$(".row .col").mouseenter(function(e){
				if(e.buttons>0){
					Game.chip.mouseConnect(this);
				}
			}).mousedown(function(){
				Game.chip.mouseConnect(this);
			});
			$("#chip").mouseleave(function(){
				Game.lastSquare = [];
			});
			$("input#ax,input#bx").attr("max",x-1);
			$("input#ay,input#by").attr("max",y-1);
		},
		"resize":function(size){
			//size should be in pixels, defining the size of each grid square.
			Game.chip.size = size;
			var style = "<style id='gridSize'>" +
						"#chip{" +
						"height: "+size*Game.chip.height+"px;}\n" +
						".row{" +
							"height: "+size+"px;}\n" +
						".col, div[class*='layer'], div[class*='current'], #chip img {" +
							"height: "+size+"px;\n" +
							"width : "+size+"px;}\n" +
						"</style>";
			$("style#chipSize").replaceWith(style);
		}
	},
	"selectors":{
		"type":"",
		"delete":false,
		"clickToHold":false
	}
};
(function(){ // Make Grid Square String
	var sili = [["pm","P_Middle"],
				["nm","N_Middle"],
				["pl","P_Left"],
				["nl","N_Left"],
				["pr","P_Right"],
				["nr","N_Right"],
				["pu","P_Up"],
				["nu","N_Up"],
				["pd","P_Down"],
				["nd","N_Down"]];
	var Silicon = '<div class="layer_silicon">';
	for (var i=0;i<10;i++){
		Silicon += '<img class="'+sili[i][0]+'" src="SmallGridSpaces/Silicon/'+sili[i][1]+'.png">';
	}
	var Metal = '<div class="layer_metal">';
	for (var i=0;i<16;i++){
		var number = i.toString(2);
		while (number.length<4){
			number = "0"+number;
		}
		Metal += '<img class="m'+number+'" src="SmallGridSpaces/Metal/1'+number+'.png">';
	}
	Game.chip.gridSquare =
		'<div class="col" unselectable="on">' +
			'<div class="layer_bg">' +
				'<img class="bg active" src="SmallGridSpaces/Extra/background.png">' +
			'</div>' +
			Silicon + '</div>' +
			'<div class="layer_gate">'+
				'<img class="npnh" src="SmallGridSpaces/Extra/NPN_H.png">'+
				'<img class="pnph" src="SmallGridSpaces/Extra/PNP_H.png">'+
				'<img class="npnv" src="SmallGridSpaces/Extra/NPN_V.png">'+
				'<img class="pnpv" src="SmallGridSpaces/Extra/PNP_V.png">'+
			'</div>' +
			'<div class="current_silicon"></div>'+
			'<div class="layer_via">' +
				'<img class="via" src="SmallGridSpaces/Extra/via.png">'+
			'</div>' +
			Metal + '</div>' +
			'<div class="current_metal"></div>'+
		'</div>';
})();
function testAppearance(loc){
	var g = Game.chip
	var loc = loc||"img.";
	g.addPic(1,1,loc+"pm");
	g.addPic(1,1,loc+"pr");
	g.addPic(2,1,loc+"pm");
	g.addPic(2,1,loc+"pl");
	g.addPic(2,1,loc+"pd");
	g.addPic(2,2,loc+"pm");
	g.addPic(2,2,loc+"pu");
	g.addPic(2,2,loc+"pd");
	g.addPic(2,3,loc+"pu");
	g.addPic(2,3,loc+"pm");
	g.addPic(3,1,loc+"nm");
	g.addPic(3,1,loc+"nd");
	g.addPic(3,2,loc+"nm");
	g.addPic(3,2,loc+"nu");
	g.addPic(3,2,loc+"nd");
	g.addPic(3,2,loc+"nl");
	g.addPic(3,3,loc+"nm");
	g.addPic(3,3,loc+"nu");
	g.addPic(3,3,loc+"m0001");
	g.addPic(2,3,loc+"m0101");
	g.addPic(1,3,loc+"m1100");
	g.addPic(1,2,loc+"m1010");
	g.addPic(1,1,loc+"m0010");
	g.addPic(2,2,loc+"pnpv");
	g.addPic(2,2,loc+"nr");
	g.addPic(1,1,loc+"via");
	g.addPic(3,3,loc+"via");
}
$(document).ready(function(){
	Game.chip.makeGrid(14,10);
	//testAppearance();
	$("#connect").click(function(e){
		e.preventDefault();
		var ax = parseInt($("fieldset#location #ax").val());
		var bx = parseInt($("fieldset#location #bx").val());
		var ay = parseInt($("fieldset#location #ay").val());
		var by = parseInt($("fieldset#location #by").val());
		var type = $("fieldset#type input:radio:checked").val();
		if (ax!=bx && ay!=by){
			alert("You must draw in a straight line or a single point.  Please correct this issue.");
			return false;
		}
		var cORd = ($("fieldset#type input[value=X]:checked").length)?"disconnect":"connect"; // connect or disconnect
		Game.chip[cORd](type,[ax,ay],[ax,ay]);
		Game.chip[cORd](type,[bx,by],[bx,by]);
		if (ay==by){
			if (ax<bx){
				for (var x=ax;x<bx;x++){
					Game.chip[cORd](type,[x,ay],[x+1,ay]);
				};
			} else {
				for (var x=ax;x>bx;x--){
					Game.chip[cORd](type,[x,ay],[x-1,ay]);
				};
			}
		} else {
			if (ay<by){
				for (var y=ay;y<by;y++){
					Game.chip[cORd](type,[ax,y],[ax,y+1]);
				};
			} else {
				for (var y=ay;y>by;y--){
					Game.chip[cORd](type,[ax,y],[ax,y-1]);
				}
			}
		}
	});
	/*/
	$("fieldset#location input").change(function(){
		var ax = parseInt($("fieldset#location #ax").val());
		var bx = parseInt($("fieldset#location #bx").val());
		var ay = parseInt($("fieldset#location #ay").val());
		var by = parseInt($("fieldset#location #by").val());
		Game.chip.deselect();
		Game.chip.select([ax,ay]);
		if (ay==by){
			if (ax<bx){
				for (var x=ax;x<bx;x++){
					Game.chip.select([x+1,by]);
				};
			} else {
				for (var x=bx;x<ax;x++){
					Game.chip.select([x,by]);
				};
			}
		}
		if (ax==bx){
			if (ay<by){
				for (var y=ay;y<by;y++){
					Game.chip.select([bx,y+1]);
				};
			} else {
				for (var y=by;y<ay;y++){
					Game.chip.select([bx,y]);
				}
			}
		}
	});
	//*/
	
	
	$("fieldset#type input#clickToHold").change(function(){
		Game.selectors.clickToHold = this.checked;
	});
	$("fieldset#type input#delete").change(function(){
		Game.selectors.delete = this.checked;
	});
	$("fieldset#type input[name='type']").change(function(){
		Game.selectors.type = $("fieldset#type input:radio:checked").val();
	});
	if (!$("fieldset#type input:radio:checked").val()){
		$("fieldset#type input[value='M']")[0].checked = true;
	}
	Game.selectors.type = $("fieldset#type input:radio:checked").val();
	Game.selectors.clickToHold = $("fieldset#type input#clickToHold")[0].checked;
	Game.selectors.delete = $("fieldset#type input#delete")[0].checked;
	$("#resetCurrent").click(function(e){
		e.preventDefault();
		Game.chip.resetCurrent();
	});
	document.onmouseup = function(){
		if(!Game.selectors.clickToHold){
			Game.lastSquare = [];
			$(".row .col.selected").removeClass("selected");
		}
	}
	Game.chip.resize(32);
	
});


