/***************************************
/ All 4-way directional arrays go Up, Right, Down, Left //URDL
/
/ 
***************************************/
window.Game = {
	"gridSquare":"",
	"lastSquare":[],
	"grid":{
		"map":[],
		"selected":[],
		/*  Functions:
				connect(): 		Triggered when you hold the mouse while moving through two zones.
									- Also triggered multiple times by line-drawing mode
				disconnect():	Triggered when you click the mouse in delete mode
				set():     		Triggered (mostly?) by Connect()
				unset():   		Triggered (mostly?) by Disconnect()
				draw():    		Triggered (only?) by set() and unset(), pulls from current map[];
				undraw():  		Triggered by set() and unset()
				checkLoc():		Checks that the parameter is a 2-element array within the grid
				select():		Highlights/Identifies grid spaces
				deselect():
				addPic():		Triggered by draw()
				rmvPic():		Triggered by draw() and undraw()
				
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
				console.log("Error: Game.grid.connect(): Needs 3 parameters");
				return false;
			}
			if (!this.checkLoc(a,".connect()")){
				return false;
			}
			if (!this.checkLoc(b,".connect(This is for b)")){
				return false;
			}
			/* A has to be greater than B on ocasion
			if (a[0]>b[0]||a[1]>b[1]){
				console.log("Error: Game.grid.connect(): a>b");
				return false;
			}*/
			if ((Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]))>1){
				console.log(a,b);
				console.log("Error: Game.grid.connect(): a and b farther than adjacent");
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
					if(dataB["S"][0] == s2){
						//console.log("Verified: connect(): dataB[\"S\"][0] == s2");
						if (dataB["S"].toString() == [s2,"",s2,"",s2].toString() && a[0]==b[0]){
							var adj1 = this.map[b[0]+1][b[1]]["G"];
							var adj2 = this.map[b[0]-1][b[1]]["G"];
							if (adj1[1]=="v" || adj2[1]=="v"){
								break;
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
								console.log(adj1,adj2);
								break;
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
						//The s2 silicon in that square cannot lead directly to another gate that it's the top of.
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
					console.log("Confirmed connect(\"V\"...");
					dataA[type][0] = dataA["G"][0]?0:1;
					dataB[type][0] = dataB["G"][0]?0:1;
				break;
				default:
					console.log("Error: Game.grid.connect(): invalid type");
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
			var adj = ["placeHolder",
					   [x,y-1,y==1],
					   [x+1,y,x==this.width],
					   [x,y+1,y==this.height],
					   [x-1,y,x==1]];
			// the i's of adj line up with the URLD directions from base.  So base["M"][i] leads to adj[i]
			// adj[i][3][*][(i+1)%4+1] goes from adj[i] to base.
			// adj[i][2] is boolean for if the square is over the edge of the grid, used to skip iterations
			for (var i=1;i<5;i++){
				if(adj[i][2]){ continue; }
				adj[i][3] = this.map[adj[i][0]][adj[i][1]];
			}
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
		"set":function(a,key,index,np){
			console.log("What the heck is using Game.grid.set()?  This is depreciated");
			if (!this.checkLoc(a,".set()")){
				return false;
			}
			var base = this.map[a[0]][a[1]][key];
			switch(key){
				case "M":
					if (index){
						this.set(a,"M",0);
					}
				case "V":
					base[index] = 1;
				break;
				case "S":
					if(index){
						if (["npnh","npnv","pnph","pnpv"].indexOf(np) == -1){
							console.log("Error: Game.grid.set(): invalid np")
						}
						base[index][1] = np[1];
						base[index][2] = np[3];
					} else {
						base[index][0] = np;
					}
				break;
				case "G":
					
				break;
				default:
					console.log("Error: Game.grid.set(): invalid key")
			}
		},
		"unset":function(a,key,index){
			console.warn("Game.grid.unset() is scheduled for deletion.  Please remove any references to this function.")
			if (!this.checkLoc(a,".unset()")){
				return false;
			}
			var base = this.map[a[0]][a[1]][key];
			switch (key){
				case "V":
					base = [0]
				break;
				case "S":
					if (index){
						this.map[a[0]][a[1]]["N"][index-1] = 0;
						this.map[a[0]][a[1]]["P"][index-1] = 0;
					} else {
						base = ["","",""];
					}
				break;
				case "G":
					
				break;
				case "M":
					
				break;
				default:
			}
			
			if (!index && key!="V"){
				this.unset(a,key,1);
				this.unset(a,key,2);
				this.unset(a,key,3);
				this.unset(a,key,4);
				if (key=="S"){
					this.map[a[0]][a[1]]["G"] = ["",0,0,0,0];
					this.undraw(a,"G");
				}
			}
			base[key][index] = 0;
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
				default:
					console.log("Error: Game.grid.draw(): key is not valid:",key);
			}
		},
		"undraw":function(a,key){
			console.warn("Game.grid.undraw() is scheduled for deletion.  Please remove any references to it as soon as possible.");
			if (!this.checkLoc(a,".undraw()")){
				return false;
			}
			var base = this.map[a[0]][a[1]][key];
			var square = $(".row:nth-child("+a[1]+") .col:nth-child("+a[0]+")");
			switch(key){
				case "M":
					square.find(".layer_metal img").removeClass('active');
				break;
				case "S":
					square.find(".layer_silicon img").removeClass('active');
				break;
				case "V":
					square.find(".layer_via img").removeClass('active');
				break;
				case "G":
					square.find(".layer_gate img").removeClass('active');
				break;
				default:
					console.log("Error: Game.grid.undraw(): key is not valid");
			}
		},
		"checkLoc":function(a,msg){
			if (!a||!a[0]||!a[1]||a[0]<1||a[1]<1||(a[0]>=Game.grid.map.length)||(a[1]>=Game.grid.map[1].length)){
				if(msg!="silent"){
					msg = "Error: Game.grid" + (msg || ".checkLoc():") + " location error:" + a + a[0] + a[1];
					console.log(msg);
				}
				return false;
			} else {
				return true;
			}
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
				console.warn("Please include 'img' in the selector parameter for Game.grid.addPic()  To expand functionality, 'img.' is being removed from addPic() and rmvPic()");
			}
			$(".row:nth-child("+y+") .col:nth-child("+x+") "+pic).addClass("active");
		},
		"rmvPic":function(x,y,pic){
			if (pic.indexOf("img")==-1){
				console.warn("Please include 'img' in the selector parameter for Game.grid.rmvPic()  To expand functionality, 'img.' is being removed from addPic() and rmvPic()");
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
							Game.grid[cORd](type,[x,ay],[x+1,ay]);
						};
					} else {
						for (var x=ax;x>bx;x--){
							Game.grid[cORd](type,[x,ay],[x-1,ay]);
						};
					}
				}
				if (ax==bx&&ay!=by){
					if (ay<by){
						for (var y=ay;y<by;y++){
							Game.grid[cORd](type,[ax,y],[ax,y+1]);
						};
					} else {
						for (var y=ay;y>by;y--){
							Game.grid[cORd](type,[ax,y],[ax,y-1]);
						}
					}
				}
				if (ax==bx&&ay==by){
					Game.grid[cORd](type,square,square);
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
	Game.gridSquare =
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
			'<div class="layer_via">' +
				'<img class="via" src="SmallGridSpaces/Extra/via.png">'+
			'</div>' +
			Metal + '</div>' +
			'<div class="layer_transparency"></div>'+
		'</div>';
})();
function makeGrid(x,y){
	console.log("Starting to make Grid.  Behind the scenes");
	Game.grid.width=x;
	Game.grid.height=y;
	x++;
	y++;
	//Functional Only//
	var m = Game.grid.map = [];
	for (var i=1;i<x;i++){
		m[i] = [];
		for (var j=1;j<y;j++){
			m[i][j] = {
				"M":[0,0,0,0,0],   		//Metal:	MURDL // <0|1>
				"S":["","","","",""],	//Silicon:	MURDL // <""|"n"|"p">
				"G":["",""],			//Gate:		type, orientation // <""|"npn"|"pnp">,<""|"h","v">
				"V":[0]           		//Via:		present // <0|1>
			}
		}
	}
	console.log("Moving onto HTML portion");
	//Appearance Only//
	var row = '<div class="row" unselectable="on">'
	var grid = '<div id="grid">'
	for (var i=1; i<x; i++){
		row += Game.gridSquare;
	}
	row += '</div>';
	for (var i=1; i<y; i++){
		grid += row;
	}
	grid += '</div>';
	console.log("Finished with string.  Inserting as HTML");
	$("#grid").replaceWith(grid);
	console.log("Finished with HTML portions");
	//Selections Only//
	$(".row .col").mouseenter(function(e){
		if(e.buttons>0){
			Game.grid.mouseConnect(this);
		}
	}).mousedown(function(){
		Game.grid.mouseConnect(this);
	});
	$("#grid").mouseleave(function(){
		Game.lastSquare = [];
	});
	$("input#ax,input#bx").attr("max",x-1);
	$("input#ay,input#by").attr("max",y-1);
}
function testAppearance(loc){
	var g = Game.grid
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
	makeGrid(14,10);
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
		Game.grid[cORd](type,[ax,ay],[ax,ay]);
		Game.grid[cORd](type,[bx,by],[bx,by]);
		if (ay==by){
			if (ax<bx){
				for (var x=ax;x<bx;x++){
					Game.grid[cORd](type,[x,ay],[x+1,ay]);
				};
			} else {
				for (var x=ax;x>bx;x--){
					Game.grid[cORd](type,[x,ay],[x-1,ay]);
				};
			}
		} else {
			if (ay<by){
				for (var y=ay;y<by;y++){
					Game.grid[cORd](type,[ax,y],[ax,y+1]);
				};
			} else {
				for (var y=ay;y>by;y--){
					Game.grid[cORd](type,[ax,y],[ax,y-1]);
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
		Game.grid.deselect();
		Game.grid.select([ax,ay]);
		if (ay==by){
			if (ax<bx){
				for (var x=ax;x<bx;x++){
					Game.grid.select([x+1,by]);
				};
			} else {
				for (var x=bx;x<ax;x++){
					Game.grid.select([x,by]);
				};
			}
		}
		if (ax==bx){
			if (ay<by){
				for (var y=ay;y<by;y++){
					Game.grid.select([bx,y+1]);
				};
			} else {
				for (var y=by;y<ay;y++){
					Game.grid.select([bx,y]);
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
	document.onmouseup = function(){
		if(!Game.selectors.clickToHold){
			Game.lastSquare = [];
			$(".row .col.selected").removeClass("selected");
		}
	}
	
});
