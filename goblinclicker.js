var resources = 
{
  "goblinseed":{"displayname":"Goblinseeds", "image":"dna.png", "amount":3},
  "berries":{"displayname":"Berries", "image":"berry.png", "amount":290},
  "meat":{"displayname":"Meat", "image":"meat.png", "amount":0},
  "exploration":{"displayname":"Miles Explored", "image":"exploration.png", "amount":0},
  "gold":{"displayname":"Gold", "image":"gold.png", "amount":0},
  "wood":{"displayname":"Wood", "image":"wood.png", "amount":0},
  "goats":{"displayname":"Goats", "image":"goat.png", "amount":0},
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
			{"name":"Spawn Goblin", "price":{"berries":100, "goblinseed":1}, "result":spawnGoblin},
			{"name":"Return Workers", "result":sendAllWorkersHome},
			{"name":"Upgrade to Hobgoblin", "price":{"berries":500, "meat":5, "goblinseed":1},
				"canSee":function(){ return knowsAboutResource(resources.meat); },
				"canDo":function(){ return canUpgradeWorker(workerTypes.hobgoblin); },
				"result":function(){ upgradeWorker(workerTypes.hobgoblin) }},
			{"name":"Upgrade to Bugbear", "price":{"berries":1500, "wood":150, "goblinseed":1},
				"canSee":function(){ return knowsAboutResource(resources.wood) && hasWorkerType(workerTypes.hobgoblin); },
				"canDo":function(){ return canUpgradeWorker(workerTypes.bugbear); },
				"result":function(){ upgradeWorker(workerTypes.bugbear) }},
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
		"actions":[{"name":"Explore", "income":{"exploration":0.01}}]
	},
	
	"huntingground":{"displayname":"Hunting Ground", "explore":3, "image":"huntingground.png",
		"actions":[{"name":"Hunt", "income":{"meat":0.1}}]
	},
	"deepwood":{"displayname":"Deepwood", "explore":16, "image":"deepwood.png",
		// 1000.1 to prevent rounding errors
		"actions":[{"name":"Chop Wood", "income":{"wood":0.1}, "resourceLimit":{"wood":1000.1}, "transformWhenExhausted":"deadwood"}],
	},
	"deadwood":{"displayname":"Deadwood", "image":"clearcut.png",
		"actions":[{"name":"Remove Stumps", "work":200, "result":{"goats":2}, "transform":"pasture"}],
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
/*	"tradingpost":{"displayname":"Trading Post", "explore":25, "image":"trader.png",
		"actions":[
			{"name":"Buy <img src='images/gold.png'>1 for ", "price":{"berries":1000}, "result":{"gold":1}},
			{"name":"Buy <img src='images/gold.png'>10 for ", "price":{"berries":10000}, "result":{"gold":10}}
		],
	},*/
}
var nextMystery = undefined;

var workerTypes =
{
  "empty":{"name":"empty", "displayname":"", "image":"", "strength":0, "upgrade":"goblin"},
  "goblin":{"name":"goblin", "displayname":"Goblin", "image":"goblin.png", "strength":1, "price":{"berries":100, "goblinseed":1}, "upgrade":"hobgoblin"},
  "hobgoblin":{"name":"hobgoblin", "displayname":"Hobgoblin", "image":"hobgoblin.png", "strength":6, "price":{"berries":1000}, "upgrade":"bugbear"},
  "bugbear":{"name":"bugbear", "displayname":"Bugbear", "image":"bugbear.png", "strength":36, "price":{"berries":1000}, "upgrade":"orc"},
  "orc":{"name":"orc", "displayname":"Orc", "image":"orc.png", "strength":200, "price":{"meat":50}, "upgrade":"blackorc"},
  "blackorc":{"name":"blackorc", "displayname":"Black Orc", "image":"blackorc.png", "strength":1200, "price":{"meat":50}, "upgrade":"troll"},
  "troll":{"name":"troll", "displayname":"Troll", "image":"troll.png", "strength":7000, "price":{"gold":10}, "upgrade":"ogre"},
  "ogre":{"name":"ogre", "displayname":"Ogre", "image":"ogre.png", "strength":42000, "upgrade":"golem"},
  "golem":{"name":"golem", "displayname":"Golem", "image":"golem.png", "strength":250000, "upgrade":"giant"},
  "giant":{"name":"giant", "displayname":"Giant", "image":"giant.png", "strength":1500000},
}

var baseWorkerType = workerTypes["empty"];
var upgradedWorkerType = workerTypes["goblin"];
var workers = [];
var tickInterval = 1; // seconds
var accelerationCheat = 50;
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
						var amountHarvested = job.income[resourceName] * worker.type.strength;
						
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
					gainResources(job.income, worker.type.strength);
				}
			}

			if( job.work !== undefined )
			{
				if(job.workDone === undefined)
				{
					job.workDone = 0;
				}
				
				job.workDone += worker.type.strength;
				
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
	updateMystery();
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
		
		if( nextMystery === undefined && location.state === LOCATION_HIDDEN && location.explore !== undefined )
		{
			nextMystery = location;
			updateMystery();
		}
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

function updateMystery()
{
	var mysteryNode = document.getElementById("html_mystery");
	if( nextMystery !== undefined && resources.exploration.amount >= 1 )
	{
		if( nextMystery.explore <= resources.exploration.amount )
		{
			nextMystery.state = LOCATION_ACTIVE;
			nextMystery = undefined;
			updateLocations();
		}
		else
		{
			mysteryNode.style.display = "initial";
			var mysteryTextNode = document.getElementById("html_mystery_text");
			mysteryTextNode.innerText = nextMystery.explore;
		}
	}
	else
	{
		mysteryNode.style.display = "none";
	}	
}

function transformLocation(location, newLocationName)
{
	location.state = LOCATION_DESTROYED;
	locations[newLocationName].state = LOCATION_ACTIVE;
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
	if( typeof(job.result) === 'function' )
	{
		job.result();
	}
	else
	{
		gainResources(job.result);
	}
	
	if( job.timesDone === undefined )
	{
		job.timesDone = 1;
	}
	else
	{
		job.timesDone++;
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

function spawnGoblin()
{
	workers.push({"index":workers.length, "job":idleAction, "type":workerTypes.goblin});
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
	var resourcesArea = document.getElementById("html_resources");
	
	for(var resourceName in resources)
	{
		var resourceType = resources[resourceName];
		
		if( resourceType.amount >= 1 && resourceType.amountNode === undefined )
		{
			resourceNode = document.createElement('div');
			resourcesArea.appendChild(resourceNode);
			
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
			
			resourceType.amountNode = resourceAmount;
			resourceType.suffixNode = resourceSuffix;
			resourceType.rateNode = resourceRate;
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
	}
}
