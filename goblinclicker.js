var accelerationCheat = 10;

var resources = 
{
  "goblinseed":{"displayname":"Goblinseeds", "image":"dna.png", "amount":3},
  "berries":{"displayname":"Berries", "image":"berry.png", "amount":290},
  "meat":{"displayname":"Meat", "image":"meat.png", "amount":0},
  "exploration":{"displayname":"Miles Scouted", "image":"exploration.png", "amount":0, "subtype":"knowledge"},
  "gold":{"displayname":"Gold", "image":"gold.png", "amount":0},
  "wood":{"displayname":"Wood", "image":"wood.png", "amount":0},
  "goats":{"displayname":"Goats", "image":"goat.png", "amount":0},
  "arcane":{"displayname":"Arcane Lore", "image":"arcane.png", "amount":0, "subtype":"knowledge"},
}

var workerTypes =
{
  "empty":{"name":"empty", "displayname":"", "image":"", "strength":0, "upgrade":"goblin"},
  "goblin":{"name":"goblin", "displayname":"Goblin", "image":"goblin.png", "strength":1, "upgrade":"hobgoblin"},
  "hobgoblin":{"name":"hobgoblin", "displayname":"Hobgoblin", "image":"hobgoblin.png", "strength":6, "upgrade":"orc"},
  //"bugbear":{"name":"bugbear", "displayname":"Bugbear", "image":"bugbear.png", "strength":36, "upgrade":"orc"},
  "orc":{"name":"orc", "displayname":"Orc", "image":"orc.png", "strength":36, "upgrade":"blackorc"},
  "blackorc":{"name":"blackorc", "displayname":"Black Orc", "image":"blackorc.png", "strength":200, "upgrade":"troll"},
  "shadow":{"name":"shadow", "displayname":"Shadow", "image":"shadow.png", "strength":200},
  "troll":{"name":"troll", "displayname":"Troll", "image":"troll.png", "strength":1200, "upgrade":"ogre"},
  "ogre":{"name":"ogre", "displayname":"Ogre", "image":"ogre.png", "strength":7000, "upgrade":"golem"},
  "golem":{"name":"golem", "displayname":"Golem", "image":"golem.png", "strength":42000, "upgrade":"giant"},
  "giant":{"name":"giant", "displayname":"Giant", "image":"giant.png", "strength":250000},
}

var LOCATION_HIDDEN = undefined;
var LOCATION_LOCKED = "LOCATION_LOCKED";
var LOCATION_BUILDABLE = "LOCATION_BUILDABLE";
var LOCATION_ACTIVE = "LOCATION_ACTIVE";
var LOCATION_DESTROYED = "LOCATION_DESTROYED";

var locations = 
{
	"queen":{"displayname":"Goblin Queen", "image":"queen.png", "state":LOCATION_ACTIVE,
		"actions":[
			{"name":"Spawn Goblin", "price":{"berries":100, "goblinseed":1}, "result":function(){spawnWorker(workerTypes.goblin);}},
			{"name":"Return Workers", "result":sendAllWorkersHome},
			{"name":"Upgrade to Hobgoblin", "price":{"berries":500, "meat":5, "goblinseed":1},
				"canSee":function(){ return knowsAboutResource(resources.meat); },
				"canDo":function(){ return canUpgradeWorker(workerTypes.hobgoblin); },
				"result":function(){ upgradeWorker(workerTypes.hobgoblin) }},
			{"name":"Upgrade to Orc", "price":{"berries":1500, "wood":150, "goblinseed":1},
				"canSee":function(){ return knowsAboutResource(resources.wood) && hasWorkerType(workerTypes.hobgoblin); },
				"canDo":function(){ return canUpgradeWorker(workerTypes.orc); },
				"result":function(){ upgradeWorker(workerTypes.orc) }},
		]
	},
	"bush":{"displayname":"Berry Bushes", "image":"bush.png", "state":LOCATION_ACTIVE,
		"actions":[{"name":"Collect Berries", "income":{"berries":1}}]
	},
	"spawningpool":{"displayname":"Spawning Pool", "image":"spawningpool2.png", "state":LOCATION_ACTIVE,
		"actions":[
			{"name":"Create <img src='images/dna.png'>", "work":100, "maxTimes":1, "upgrade":1, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":120, "maxTimes":1, "upgrade":1, "requireUpgrade":1, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":150, "maxTimes":1, "upgrade":1, "requireUpgrade":2, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":180, "maxTimes":1, "upgrade":1, "requireUpgrade":3, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":220, "maxTimes":1, "upgrade":1, "requireUpgrade":4, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":270, "maxTimes":1, "upgrade":1, "requireUpgrade":5, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":330, "maxTimes":1, "upgrade":1, "requireUpgrade":6, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":400, "maxTimes":1, "upgrade":1, "requireUpgrade":7, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":480, "maxTimes":1, "upgrade":1, "requireUpgrade":8, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":570, "maxTimes":1, "upgrade":1, "requireUpgrade":9, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":670, "maxTimes":1, "upgrade":1, "requireUpgrade":10, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":780, "maxTimes":1, "upgrade":1, "requireUpgrade":11, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":900, "maxTimes":1, "upgrade":1, "requireUpgrade":12, "result":{"goblinseed":1}},
			{"name":"Create <img src='images/dna.png'>", "work":1030, "maxTimes":1, "upgrade":1, "requireUpgrade":13, "result":{"goblinseed":1}},
		]
	},
	"unknownlands":{"displayname":"Unknown Lands", "image":"map.png", "state":LOCATION_ACTIVE,
		"actions":[
			{"name":"Scout North", "maxTimes":1, "upgrade":1, "work":100, "result":function(){ discoverLocation(locations.deepwood); hideIfExhausted(locations.unknownlands); }},
			{"name":"Scout South", "maxTimes":1, "upgrade":1, "work":100, "result":function(){ discoverLocation(locations.tower); hideIfExhausted(locations.unknownlands); }},
			{"name":"Scout East", "maxTimes":1, "upgrade":1, "work":100, "result":function(){ discoverLocation(locations.huntingground); hideIfExhausted(locations.unknownlands); }},
			{"name":"Scout West", "maxTimes":1, "upgrade":1, "work":100, "result":function(){ discoverLocation(locations.tradingpost); hideIfExhausted(locations.unknownlands); }},
		]
	},
	
	"huntingground":{"displayname":"Hunting Ground", "discovery":{"type":"exploration", "amount":20}, "image":"huntingground.png",
		"actions":[{"name":"Hunt", "income":{"meat":0.1}}]
	},
	
	"tower":{"displayname":"Abandoned Tower", "discovery":{"type":"exploration", "amount":50}, "image":"tower.png",
		"actions":[{"name":"Investigate", "work":200, "transform":"library"}]
	},
	"library":{"displayname":"Arcane Library", "image":"tower.png",
		"actions":[{"name":"Study", "income":{"arcane":1}}]
	},
	"pentagram_blueprint":{"displayname":"Pentagram", "discovery":{"type":"arcane", "amount":50}, "image":"pentagram_blueprint.png",
		"actions":[{"name":"Build", "work":500, "transform":"pentagram"}]
	},
	"pentagram":{"displayname":"Pentagram", "image":"pentagram.png",
		"actions":[{"name":"Summon Shadow", "maxTimes":1, "work":500, "result":function(){spawnWorker(workerTypes.shadow);}}]
	},
	"conduit_blueprint":{"displayname":"Demonic Conduit", "discovery":{"type":"arcane", "amount":150}, "image":"conduit_blueprint.png",
		"actions":[{"name":"Build", "work":500, "transform":"conduit"}]
	},
	"conduit":{"displayname":"Demonic Conduit", "image":"conduit.png",
		"actions":[
			{"name":"Upgrade Orc to Black Orc", "price":{"meat":1500, "goblinseed":1},
				"canDo":function(){ return canUpgradeWorker(workerTypes.blackorc); },
				"result":function(){ upgradeWorker(workerTypes.blackorc) }},
		]
	},

	"deepwood":{"displayname":"Deepwood", "discovery":{"type":"exploration", "amount":150}, "image":"deepwood.png",
		// 1000.1 to prevent rounding errors
		"actions":[{"name":"Chop Wood", "income":{"wood":0.1}, "resourceLimit":{"wood":1000.1}, "transformWhenExhausted":"deadwood"}],
	},
	"deadwood":{"displayname":"Deadwood", "image":"clearcut.png",
		"actions":[{"name":"Remove Stumps", "work":2000, "result":{"goats":2}, "transform":"pasture"}],
	},
	"pasture":{"displayname":"Pastures", "image":"pasture.png",
		"actions":[{"name":"Breed Goats", "maxWorkers":1,
		"tick":function(worker)
			{
				var breedingRate = resources.goats.amount * 0.05;
				if( breedingRate > worker.type.strength )
					breedingRate = worker.type.strength;
				
				if( resources.goats.amount < 2 )
					breedingRate = 0;
					
				worker.job.income = {"goats":breedingRate/worker.type.strength};
			}
		}],
	},
	"tradingpost":{"displayname":"Trading Post", "explore":25, "image":"trader.png",
		"actions":[
			{"name":"Buy <img src='images/gold.png'>1 for ", "price":{"berries":1000}, "result":{"gold":1}},
			{"name":"Buy <img src='images/gold.png'>10 for ", "price":{"berries":10000}, "result":{"gold":10}}
		],
	},
}

var workers = [];
var tickInterval = 0.1; // seconds
var idleAction = locations.queen.actions[1];
idleAction.location = locations.queen;

window.onload = function()
{
	updateResources();
	updateLocations();
	updateWorkforce();
	updateActions();

	if( accelerationCheat <= 0 )
		setInterval(tick,1000*tickInterval);
	else
		setInterval(tick,1000*tickInterval/accelerationCheat);
}

function tick()
{
	for(var Idx = 0; Idx < workers.length; ++Idx )
	{
		worker = workers[Idx];
		if( worker.job !== undefined )
		{
			var job = worker.job;
			if( job.tick !== undefined )
			{
				job.tick(worker);
			}
			
			if( job.income !== undefined )
			{				
				if( job.resourceLimit !== undefined )
				{
					if( job.resources === undefined )
					{
						job.resources = {};
						for( var resourceName in job.resourceLimit )
						{
							job.resources[resourceName] = job.resourceLimit[resourceName];
						}
					}
					
					for( var resourceName in job.income )
					{
						var amountAvailable = job.resources[resourceName];
						var amountHarvested = job.income[resourceName] * worker.type.strength * tickInterval;
						
						if( amountAvailable > amountHarvested )
						{
							resources[resourceName].amount += amountHarvested;
							job.resources[resourceName] -= amountHarvested;
						}
						else
						{
							resources[resourceName].amount += amountAvailable;
							job.resources[resourceName] = 0;
							
							sendWorkersHomeFromJob(job);
							
							if( job.transformWhenExhausted !== undefined )
							{
								transformLocation(job.location, job.transformWhenExhausted);
							}
						}
					}
				}
				else
				{
					gainResources(job.income, worker.type.strength * tickInterval);
				}
			}

			if( job.work !== undefined )
			{
				if(job.workDone === undefined)
				{
					job.workDone = 0;
				}
				
				job.workDone += worker.type.strength * tickInterval;
				
				if( job.workDone >= job.work )
				{
					doJobResult(job);
					sendWorkersHomeFromJob(job);
				}
			}
		}
	}
	
	updateResources();
	updateActions();
}


//==========================================
// LOCATIONS
//==========================================

function updateLocations()
{
	for(var locationName in locations)
	{
		var location = locations[locationName];
		updateLocation(location);
	}
}

function updateLocation(location)
{
	if( location.state === LOCATION_HIDDEN )
	{
		if( location.explore !== undefined && resources.exploration.amount >= location.explore )
		{
			location.state = LOCATION_ACTIVE;
		}
	}
	
	if( location.state !== LOCATION_HIDDEN && location.state !== LOCATION_DESTROYED )
	{
		if( location.node === undefined )
		{
			var locationsArea = document.getElementById("html_locations");

			locationNode = document.createElement('div');
			locationNode.style.display="inline-block";
			locationNode.style.verticalAlign="text-top";
			locationNode.style.padding="0px 5px 20px 5px";
			locationNode.style.width = 160;
			locationsArea.appendChild(locationNode);

			var locationName = document.createElement('div');
			locationName.innerText = location.displayname;
			locationNode.appendChild(locationName);
			locationName.style.fontWeight="bold";
			
			var locationIcon = document.createElement('img');
			locationIcon.src = "images/"+location.image;
			locationNode.appendChild(locationIcon);

			var locationWorkers = document.createElement('div');
			locationWorkers.style.display="inline-block";
			locationNode.appendChild(locationWorkers);
			
			for( var Idx = 0; Idx < 10; ++Idx )
			{
				if( Idx > 0 && Idx%5 === 0 )
				{
					locationWorkers.appendChild(document.createElement('br'));
				}
				locationWorkers.appendChild(document.createElement('img'));
			}
			
			var locationButtons = document.createElement('div');
			locationNode.appendChild(locationButtons);
			
	/*			var resourceAmount = document.createElement('span');
			resourceAmount.innerText = resourceType.amount;
			resourceNode.appendChild(resourceAmount);		
	*/
			location.node = locationNode;
			location.workersNode = locationWorkers;
			location.actionButtons = locationButtons;
		}
		
		location.node.style.display = "inline-block";
	}
	else if( location.node !== undefined )
	{
		location.node.style.display = "none";
	}

	if( location.actionButton !== undefined )
	{
		updateLocationAction(location);
	}

	if( location.node !== undefined )
	{
//			resourceType.node.innerText = resourceType.amount;
	}
	
	if( location.workersNode !== undefined )
	{
		displayWorkers(location.workersNode, workers, location);
	}
}

function transformLocation(location, newLocationName)
{
	location.state = LOCATION_DESTROYED;
	locations[newLocationName].state = LOCATION_ACTIVE;
	updateLocations();
}

function discoverLocation(location)
{
	location.state = LOCATION_ACTIVE;
	updateLocations();
}

function hideIfExhausted(location)
{
	for( var Idx = 0; Idx < location.actions.length; ++Idx )
	{
		var action = location.actions[Idx];
		if( canSeeAction(action) )
		{
			return;
		}
	}
	
	location.state = LOCATION_HIDDEN;
	updateLocations();
}

//==========================================
// JOBS AND ACTIONS
//==========================================

function updateActions()
{
	for(var locationName in locations)
	{
		var location = locations[locationName];
		updateLocationActions(location);
	}
}

function updateLocationActions(location)
{
	if( location.actions === undefined || location.actionButtons === undefined )
	{
		return;
	}
	
	var actionButtons = location.actionButtons.children;
	
	for( var Idx = 0; Idx < location.actions.length; ++Idx )
	{
		var action = location.actions[Idx];
		action.location = location;

		var actionButton = actionButtons[Idx];
		var actionname = getActionName(action);

		if( actionButton === undefined )
		{
			actionButton = document.createElement('button');
			location.actionButtons.appendChild(actionButton);
			actionButton.onclick = function(localAction){ return function(){ startAction(localAction); } }(action);
		}
		
		if( actionname !== undefined && canSeeAction(action) )
		{			
			actionButton.style.display = "initial";
			actionButton.disabled = !canDoAction(action);

			var actionprice = getActionPrice(action);
			
			if( action.showingPrice !== actionprice || action.showingName !== actionname || (action.workDone > 0 && action.progressNode === undefined))
			{
				actionButton.innerHTML = actionname;
				
				if( action.work !== undefined && action.workDone > 0 )
				{
					action.progressNode = document.createElement('span');
					actionButton.appendChild(action.progressNode);
				}

				actionButton.appendChild(document.createElement('br'));
				
				for(var resourceName in actionprice)
				{					
					var resourceIcon = document.createElement('img');
					resourceIcon.src = "images/"+resources[resourceName].image;
					actionButton.appendChild(resourceIcon);
					
					var resourceCostLabel = document.createElement('span');
					resourceCostLabel.innerText = actionprice[resourceName];
					actionButton.appendChild(resourceCostLabel);
				}
				
				action.showingPrice = actionprice;
				action.showingName = actionname;
			}
			
			if( action.progressNode !== undefined )
			{
				action.progressNode.innerText = " ("+(action.workDone*100/action.work).toFixed(1)+"%)";
			}
		}
		else if( actionButton !== undefined )
		{
			actionButton.style.display = "none";
		}
	}
}

function getActionName(action)
{
	var actionname = action.name;
	if( typeof(actionname) === 'function' )
	{
		actionname = actionname();
	}
	
	return actionname;
}

function getActionPrice(action)
{
	var actionprice = action.price;
	if( typeof(actionprice) === 'function' )
	{
		actionprice = actionprice();
	}
	
	return actionprice;
}

function canSeeAction(action)
{
	if( action.maxTimes !== undefined && action.timesDone !== undefined && action.maxTimes <= action.timesDone )
	{
		return false;
	}
	
	if( action.requireUpgrade !== undefined )
	{
		if( action.location.upgraded === undefined || action.location.upgraded < action.requireUpgrade )
		{
			return false;
		}
	}

	if( action.atUpgrade !== undefined && action.location.upgraded !== action.atUpgrade )
	{
		return false;
	}
	
	if( action.canSee !== undefined && !action.canSee() )
	{
		return false;
	}
	
	return true;
}

function numWorkersForJob(job)
{
	var numWorkers = 0;
	for( var Idx = 0; Idx < workers.length; ++Idx )
	{
		if( workers[Idx].job === job )
			numWorkers++;
	}
	
	return numWorkers;
}

function canDoAction(action)
{
	if( !canSeeAction(action) ) // the button shouldn't be clickable in this case, but maybe there's a timing window
	{
		return false;
	}
	
	var actionprice = getActionPrice(action);
	
	if( actionprice !== undefined && !canPay(actionprice) )
	{
		return false;
	}
	
	if( (action.work !== undefined || action.income !== undefined) && !hasFreeWorkers()) // can't assign a worker unless one is free
	{
		return false;
	}

	if( action.canDo !== undefined && !action.canDo() )
	{
		return false;
	}
	
	if( action.maxWorkers !== undefined )
	{
		if( numWorkersForJob(action) >= action.maxWorkers )
		{
			return false;
		}
	}
	
	return true;
}

function startAction(action)
{
	if( !canDoAction(action) ) // the button should be disabled, but check in case there's a timing window
	{
		return;
	}
	
	var price = action.price;
	if( typeof(price) === 'function' )
	{
		price = price();
	}
	
	if( price !== undefined )
	{
		if( !tryToPay(price) )
		{
			return;
		}
	}

	// assign a worker to this job
	if( action.work !== undefined || action.income !== undefined || action.tick !== undefined )
	{
		for( var Idx = 0; Idx < workers.length; ++Idx )
		{
			var worker = workers[Idx];
			if( worker.job === undefined || worker.job.location === locations.queen )
			{
				worker.job = action;
				break;
			}
		}
	}
	else
	{
		doJobResult(action);
	}

	updateWorkforce();
	updateLocation(locations.queen);
	updateLocation(action.location);
	updateLocationActions(action.location);
}

function doJobResult(job)
{
	if( job.timesDone === undefined )
	{
		job.timesDone = 1;
	}
	else
	{
		job.timesDone++;
	}
	
	if( typeof(job.result) === 'function' )
	{
		job.result();
	}
	else
	{
		gainResources(job.result);
	}
	
	if( job.upgrade !== undefined )
	{
		if( job.location.upgraded === undefined )
		{
			job.location.upgraded = 0;
		}
		job.location.upgraded += job.upgrade;
	}
	
	if( job.transform !== undefined )
	{
		transformLocation(job.location, job.transform);
	}
}

//==========================================
// SPAWNING
//==========================================

function getSpawnTitle()
{
	if( upgradedWorkerType === undefined )
	{
		return undefined;
	}
	else if( upgradedWorkerType === workerTypes.goblin )
	{
		return "Spawn a Goblin";
	}
	else
	{
		return baseWorkerType.displayname + "->" + upgradedWorkerType.displayname;
	}
}

function getSpawnPrice()
{
	if( upgradedWorkerType !== undefined )
	{
		return upgradedWorkerType.price;
	}
	else
	{
		return undefined;
	}
}

function canUpgradeWorker(targetType)
{
	for( var Idx = 0; Idx < workers.length; ++Idx )
	{
		var worker = workers[Idx];
		if( worker.type.upgrade === targetType.name )
		{
			return true;
		}
	}
	
	return false;
}

function upgradeWorker(targetType)
{
	for( var Idx = 0; Idx < workers.length; ++Idx )
	{
		var worker = workers[Idx];
		if( worker.type.upgrade === targetType.name )
		{
			worker.type = targetType;
			break;
		}
	}

	updateWorkforce();
	updateLocations();
}

function hasWorkerType(workerType)
{
	for( var Idx = 0; Idx < workers.length; ++Idx )
	{
		if( workers[Idx].type === workerType )
		{
			return true;
		}
	}
	
	return false;
}

function spawnWorker(workerType)
{
	workers.push({"index":workers.length, "job":idleAction, "type":workerType});
	updateWorkforce();
	updateLocations();
}
/*	if( upgradedWorkerType !== undefined )
	{
		var allUpgraded = false;
		if( workers.length < maxWorkers )
		{
			workers.push({"index":workers.length, "job":idleAction, "type":upgradedWorkerType});
			
			if( workers.length === maxWorkers )
			{
				allUpgraded = true;
			}
		}
		else
		{
			for( var Idx = 0; Idx < workers.length; ++Idx )
			{
				if( workers[Idx].type === baseWorkerType )
				{
					workers[Idx].type = upgradedWorkerType;
					if( Idx === workers.length-1 )
					{
						allUpgraded = true;
					}
					break;
				}
			}
		}

		if( allUpgraded )
		{
			baseWorkerType = upgradedWorkerType;
			upgradedWorkerType = workerTypes[upgradedWorkerType.upgrade];
			
			if( upgradedWorkerType === undefined )
			{
				locations.queen.actionname = undefined;
			}
			else
			{
				locations.queen.actionname = baseWorkerType.displayname + " -> " + upgradedWorkerType.displayname;
			}
		}
	}

	updateWorkforce();
	updateResources();
	updateLocations();
}*/

//==========================================
// WORKERS
//==========================================

function sendAllWorkersHome()
{
	for(var Idx = 0; Idx < workers.length; ++Idx )
	{
		sendWorkerHome(workers[Idx]);
	}
}

function sendWorkersHomeFromJob(job)
{
	for(var Idx = 0; Idx < workers.length; ++Idx )
	{
		if( workers[Idx].job === job )
		{
			sendWorkerHome(workers[Idx]);
		}
	}
}

function sendWorkerHome(worker)
{
	if( worker.job.location !== locations.queen )
	{
		var oldJob = worker.job;
		worker.job = idleAction;
		updateLocation(oldJob.location);
		updateLocation(locations.queen);
	}
}

function hasFreeWorkers()
{
	for(var Idx = 0; Idx < workers.length; ++Idx )
	{
		if( workers[Idx].job.location === locations.queen )
			return true;
	}
	
	return false;
}

function updateWorkforce()
{
	var workforceStrength = 0;
	for( var Idx = 0; Idx < workers.length; ++Idx )
	{
		workforceStrength += workers[Idx].type.strength;
	}

	var workforceStrengthNode = document.getElementById("html_workforce_strength");
	workforceStrengthNode.innerText = workforceStrength;
}

function displayWorkers(node, workerArray, location)
{
	var workerIcons = node.children;
	var iconIdx = 0;
	
	for(var workerIdx = 0; workerIdx < workerArray.length; ++workerIdx )
	{
		var worker = workerArray[workerIdx];
		if( worker !== undefined && worker.job.location === location )
		{
			var workerIcon = workerIcons[iconIdx];
			if( workerIcon !== undefined && workerIcon.nodeName === "BR" )
			{
				iconIdx++;
				workerIcon = workerIcons[iconIdx];
			}
			if( workerIcon === undefined )
			{
				if( iconIdx === 5 )
				{
					node.appendChild(document.createElement('br'));
					iconIdx++;
				}
				var workerIcon = document.createElement('img');
				node.appendChild(workerIcon);
			}

			workerIcon.src = "images/"+worker.type.image;
			workerIcon.style.display = "initial";
			workerIcon.onclick = function(localworker){ return function(){ sendWorkerHome(localworker);}; }(worker);
			
			++iconIdx;
		}
	}

	for(; iconIdx < workerIcons.length; ++iconIdx )
	{
		workerIcons[iconIdx].style.display = "none";
		workerIcons[iconIdx].onclick = undefined;
	}
}

//==========================================
// RESOURCES
//==========================================

function knowsAboutResource(resource)
{
	return resource.amountNode !== undefined;
}

function gainResources(resourceBundle, multiplier)
{
	for(var resourceName in resourceBundle)
	{
		if( multiplier === undefined )
		{
			resources[resourceName].amount += resourceBundle[resourceName];
		}
		else
		{
			resources[resourceName].amount += resourceBundle[resourceName] * multiplier;
		}
		
		if( resources[resourceName].amount > 0 && resources[resourceName].amount < 1 )
		{
			resources[resourceName].amount = 1;
		}
	}
	
	updateResources();
}

function canPay(price)
{
	for(var resourceName in price)
	{
		var resource = resources[resourceName];
		if( resource === undefined )
		{
			alert("Unknown resource "+resourceName);
			return false;
		}
		else if( resource.amount < price[resourceName] )
		{
			return false;
		}
	}
	
	return true;
}

function tryToPay(price)
{
	if( !canPay(price) )
	{
		return false;
	}	

	for(var resourceName in price)
	{
		resources[resourceName].amount -= price[resourceName];
	}
	updateResources();
	return true;
}

function updateResources()
{	
	for(var resourceName in resources)
	{
		var resourceType = resources[resourceName];
		
		if( resourceType.amount >= 1 && resourceType.node === undefined )
		{
			resourceNode = document.createElement('div');
			
			var resourceDiscovery;
			var resourceDiscoveryAmount;
			
			if( resourceType.subtype === "knowledge" )
			{
				var knowledgeArea = document.getElementById("html_knowledge_resources");
				knowledgeArea.appendChild(resourceNode);
				
				var knowledgeSubheading = document.getElementById("html_knowledge");
				knowledgeSubheading.style.display = "initial";
				
				resourceDiscovery = document.createElement('em');
				resourceDiscovery.innerText = " Next Discovery:";
				
				resourceDiscoveryAmount = document.createElement('span');
				resourceDiscoveryAmount.innerText = "0";

				var discoverySuffixNode = document.createElement('span');
				discoverySuffixNode.innerText = " "+resourceType.displayname;
				
				resourceDiscovery.appendChild(resourceDiscoveryAmount);
				resourceDiscovery.appendChild(discoverySuffixNode);
			}
			else
			{
				var resourcesArea = document.getElementById("html_resources");
				resourcesArea.appendChild(resourceNode);
			}
			
			var resourceIcon = document.createElement('img');
			resourceIcon.src = "images/"+resourceType.image;
			resourceNode.appendChild(resourceIcon);

			var resourceAmount = document.createElement('span');
			resourceAmount.innerText = Math.floor(resourceType.amount);
			resourceNode.appendChild(resourceAmount);		

			var resourceName = document.createElement('span');
			resourceName.innerText = " "+resourceType.displayname;
			resourceNode.appendChild(resourceName);
			
			var resourceSuffix = document.createElement('span');
			resourceNode.appendChild(resourceSuffix);

				var resourceRateA = document.createElement('span');
				resourceRateA.innerText = " (+";
				resourceSuffix.appendChild(resourceRateA);
				
				var resourceRate = document.createElement('span');
				resourceRate.innerText = resourceType.displayname;
				resourceSuffix.appendChild(resourceRate);

				var resourceRateC = document.createElement('span');
				resourceRateC.innerText = "/s)";
				resourceSuffix.appendChild(resourceRateC);
				
			if( resourceDiscovery !== undefined )
			{
				resourceNode.appendChild(resourceDiscovery);
			}
			
			resourceType.node = resourceNode;
			resourceType.amountNode = resourceAmount;
			resourceType.suffixNode = resourceSuffix;
			resourceType.rateNode = resourceRate;
			resourceType.discoveryNode = resourceDiscovery;
			resourceType.discoveryAmountNode = resourceDiscoveryAmount;
		}

		if( resourceType.amountNode !== undefined )
		{
			resourceType.amountNode.innerText = Math.floor(resourceType.amount);
		}
		
		if( resourceType.rateNode !== undefined )
		{
			var incomeRate = 0;
			for(var Idx = 0; Idx < workers.length; ++Idx )
			{
				var worker = workers[Idx];
				if( worker.job !== undefined && worker.job.income !== undefined &&
					worker.job.income[resourceName] !== undefined )
				{
					incomeRate += worker.job.income[resourceName] * worker.type.strength;
				}
			}
			
			if( incomeRate > 0 )
			{
				resourceType.suffixNode.style.display = "initial";
				if( incomeRate < 0.1 )
				{
					resourceType.rateNode.innerText = Number(incomeRate).toFixed(2);
					resourceType.amountNode.innerText = resourceType.amount.toFixed(1);
				}
				else
				{
					resourceType.rateNode.innerText = Number(incomeRate).toFixed(1);
				}
			}
			else
			{
				resourceType.suffixNode.style.display = "none";
			}
		}
		
		if( resourceType.subtype === "knowledge" )
		{
			if( resourceType.nextMystery === undefined )
			{
				for( var locationName in locations)
				{
					var location = locations[locationName];
					if( location.state === LOCATION_HIDDEN &&
						location.discovery !== undefined &&
						location.discovery.type === resourceName &&
						(resourceType.nextMystery === undefined || resourceType.nextMystery.discovery.amount > location.discovery.amount) )
					{
						resourceType.nextMystery = location;
					}
				}
			}
			
			if( resourceType.discoveryNode !== undefined )
			{
				if( resourceType.nextMystery !== undefined )
				{
					resourceType.discoveryNode.style.display = "initial";
					resourceType.discoveryAmountNode.innerText = resourceType.nextMystery.discovery.amount;
					
					if( resourceType.nextMystery.discovery.amount <= resourceType.amount )
					{
						discoverLocation(resourceType.nextMystery);
						resourceType.nextMystery = undefined;
					}
				}
				else
				{
					resourceType.discoveryNode.style.display = "none";
				}
			}
		}
	}
}
