var makeBlockWorld = editor.get("model");

///////////////////
//// Semantics ////
///////////////////

var isRed = function(obj) {
  return obj.color == 'red';
}

var isYellow = function(obj) {
  return obj.color == 'yellow';
}

var isTall = function(stack) {
  return stack.height >= 100;
}

var isShort = function(stack) {
  return stack.height <= 60;
}

var isOnLeft = function(obj) {
  return obj.x <= 270;
}

var isOnRight = function(obj) {
  return obj.x >= 330;
}

var isOnMiddle = function(obj) {
  return !isOnLeft(obj) && !isOnRight(obj);
}

var isOnEdge = function(obj) {
  return obj.x == 200 || obj.x == 400;
}

var isOnCenter = function(obj) {
  return obj.x == 300;
}

var isOnGround = function(obj) {
  return obj.y > 400;
}

var isNear = function(obj1) {
  return function(obj2) {
    return Math.abs(obj1.x - obj2.x) <= 40;
  }
}

/////////////////////////////////////
//// Visualization and inference ////
/////////////////////////////////////

var flattenWorld = function(world) {
  return [world.ground, world.table, world.force].concat(world.blocks);
}

var visualizeConds = function(world) {
//   condition(any(isTall, world.stacks));
//   condition(filter(isTall, filter(isOnCenter, filter(isRed, world.stacks))).length > 0);
//   condition(all(isRed, filter(isOnRight, world.stacks)));
//   condition(filter(isYellow, (filter(isOnLeft, world.blocks))).length == filter(isOnLeft, world.blocks).length/2);
//   condition(filter(isOnLeft, world.blocks).length > 0);
//   condition(filter(isOnLeft, world.blocks).length == 2 && all(isRed, filter(isOnLeft, world.blocks)));


  
  var flatWorld = flattenWorld(world);
  var finalWorld = physics.run(1, flatWorld);
//   return finalWorld[0].velocity[0] > 0;
//   return filter(red, finalWorld).length;
  return finalWorld;
}

var w = Infer({method: 'rejection', samples: 1},
            function() { return visualizeConds(makeBlockWorld()) });
var theWorld = w.toString().slice(14, -4);
// console.log(theWorld);
// physics.animate(1, JSON.parse(theWorld));

var run = function(world) {

// condition(filter(isShort, filter(isOnLeft, (filter(isRed, world.stacks)))).length == 1);

// condition(filter(isTall, filter(isOnRight, (filter(isYellow, world.stacks)))).length == 1);

// condition(isOnLeft(world.force));
  
  var flatWorld = flattenWorld(world);
  var finalWorld = physics.run(1000, flatWorld);
//   return finalWorld[0].velocity[0] > 0;
//   return filter(red, finalWorld).length;
  var objectsOnGround = filter(isOnGround, finalWorld);
  condition(objectsOnGround.length > 2);
  var numYellow = filter(isYellow, objectsOnGround).length;
  var numRed = filter(isRed, objectsOnGround).length;
  return numYellow > numRed? 2 : numYellow == numRed? 1 : 0
}

// viz(Infer({method: 'forward', samples: 100},
//            function() { return run(makeBlockWorld()) }))


var result = function () {
  var d = Infer({method: 'rejection', samples: 10},
            function() { return run(makeBlockWorld()) });
  var moreRedProb = Math.exp(d.score(0));
  var moreYellowProb = Math.exp(d.score(2));
  var likert = Math.round((moreYellowProb / (moreRedProb + moreYellowProb)) * 6) + 1;
  return likert;
}

viz(Infer({method: 'forward', samples: 25}, result));

// Simulating and animating the world
// physics.animate(1000, flattenWorld(makeBlockWorld()));
// physics.run(1000, makeBlockWorld());