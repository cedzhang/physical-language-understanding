//////////////////////////////
// Distributions
//////////////////////////////

var geometric = function(p) {
  return flip(p) ? 1 + geometric(p) : 1
}

//////////////////////////////
// Object definitions
//////////////////////////////

// var dim = function() { return uniform(5, 10) }
var dim = 7.5;
var color = function() { return flip() ? 'red' : 'yellow' }
var stackHeight = function() { return geometric(0.7) }
// var numStacks = function() {return sample(Poisson({mu: 3.5}))}
var numStacks = function() {return 2}

var xposOnTable = function() { 
  return uniform(worldWidth/2 - 100, worldWidth/2 + 100) }

var ground = {shape: 'rect',
  static: true,
  dims: [100000*worldWidth, 10],
  x: worldWidth/2,
  y: worldHeight
}

var table = {shape: 'rect',
  static: false,
  dims: [100, 100],
  x: worldWidth/2,
  y: 390,
  color: 'blue'
}

// Forces

var leftCircle = {shape: 'circle',
  static: false,
  dims: [20],
  x: 100,
  y: 310,
  color: 'green',
  velocity: [10000, 0] 
}

var rightCircle = {shape: 'circle',
  static: false,
  dims: [20],
  x: worldWidth - 100,
  y: 310,
  color: 'green',
  velocity: [-10000, 0] 
}

//////////////////////////////
// Make stacks
//////////////////////////////

var xpos = function (prevBlock) {
  return prevBlock.x
}

var ypos = function (prevBlock, h) {
  var prevY = prevBlock.y;
  var prevH = prevBlock.dims[1];
  return prevY - (prevH + h)
}

var addBlock = function(prevBlock, isFirst) {
  return {
    shape: 'rect',
    color: isFirst? color() : prevBlock.color,
    static: false,
    dims: [dim, dim],
    x: isFirst? xposOnTable() : xpos(prevBlock),
    y: ypos(prevBlock, dim)
  }
}


var stack = function(stackSoFar, h) {
  var newBlock = addBlock(stackSoFar[stackSoFar.length - 1], false);
  var theStack = stackSoFar.concat(newBlock);
  if (stackSoFar.length >= h) {
    console.log()
    return stackSoFar;
  } else {
    return stack(theStack, h);
  }
}

var makeStacks = function(stacksSoFar, n) {
  var height = stackHeight();
  var newStack = stack([addBlock(table, true)], height);
  var stacks = stacksSoFar.concat([newStack]);
  if (stacksSoFar.length >= n) {
    return stacksSoFar;
  } else {
    return makeStacks(stacks, n);
  }
}


//////////////////////////////
// Make world
//////////////////////////////

var makeBlockWorld = function() {
  var n = numStacks();
  var stacks = makeStacks([], n);
  var force = flip()? leftCircle : rightCircle;
  var blockList = stacks.flat();
  var world = [ground, table, force].concat(blockList);
//   var world = [ground, table, force]
  return world;
}

var red = function(obj) {
  return obj.color == 'red';
}

var yellow = function(obj) {
  return obj.color == 'yellow';
}

var tall = function(obj) {
  return obj.y < 250;
}



var run = function(world) {
  condition(filter(red, world).length >= 1);
//   condition(any(tall, world));
  var finalWorld = physics.run(1000, world);
//   return finalWorld[0].velocity[0] > 0;
  return filter(red, finalWorld).length;
}

// viz(Infer({method: 'rejection', samples: 1000},
//            function() { return run(makeBlockWorld()) }))

//Simulating and animating the world

physics.animate(1000, makeBlockWorld());