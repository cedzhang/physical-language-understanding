var makeBlockWorld = function() {

  //// Distributions and parameters ////

  var truncGeom = function(p, m, n) {
    if (m > n) {
      return uniformDraw(_.range(1, n+1));
    } else {
      return flip(p) ? truncGeom(p, m+1, n) : m;
    }
  }
  
//   var dim = function() { return uniform(5, 10) }
  var dim = 10;
  var tableSize = 100;
  var color = function() { return flip() ? 'red' : 'yellow' };
  var monoColor = flip();
  var stackHeight = function() { return truncGeom(0.5, 1, 8) };
//   var numStacks = function() {return sample(Poisson({mu: 3}))+1};
//   var numStacks = uniformDraw(_.range(1, 9));
  var numStacks = truncGeom(0.5, 1, 8);
  var xpositions = _.range(worldWidth/2 - tableSize, worldWidth/2 + tableSize + 20, 20);

  //// Object definitions ////

  var ground = {shape: 'rect',
                static: true,
                dims: [100000*worldWidth, 10],
                x: worldWidth/2,
                y: worldHeight
               }

  var table = {shape: 'rect',
               static: false,
               dims: [tableSize, tableSize],
               x: worldWidth/2,
               y: 390,
               color: 'blue'
              }

  var force = function() {
    var left = flip();
    return {shape: 'square',
            static: false,
            dims: [uniformDraw([15, 16, 17, 18])],
            x: left? 100 : worldWidth - 100,
            y: 310,
            color: 'green',
            velocity: left? [10000, 0] : [-10000, 0]
           }
  }

//// Make stacks ////
  
  var xposOnTable = function(options) { 
    return uniformDraw(options); 
  }

  var xpos = function(prevBlock) {
    return prevBlock.x
  }

  var ypos = function(prevBlock, h) {
    var prevY = prevBlock.y;
    var prevH = prevBlock.dims[1];
    return prevY - (prevH + h)
  }

  var addBlock = function(prevBlock, isFirst) {
    var xposition = xposOnTable(xpositions);
    if (isFirst) {
//       console.log("First");
      var index = xpositions.indexOf(xposition);
      xpositions.splice(index, 1);
//       console.log(xpositions);
    }
    return {shape: 'rect',
            color: isFirst || !monoColor? color() : prevBlock.color,
            static: false,
            dims: [dim, dim],
            x: isFirst? xposition : xpos(prevBlock),
            y: ypos(prevBlock, dim)
           }
  }

  var stack = function(stackSoFar, h) {
    var newBlock = addBlock(stackSoFar[stackSoFar.length-1], false);
    var theStack = stackSoFar.concat(newBlock);
    if (stackSoFar.length >= h) {
      return stackSoFar;
    } else {
      return stack(theStack, h);
    }
  }

  var makeStacks = function(stacksSoFar, n) {
    var height = stackHeight();  
    var newStack = stack([addBlock(table, true)], height);
    var stacks = stacksSoFar.concat([newStack]);
//     var index = xpositions.indexOf(stacks[stacks.length - 1][0].x);
//     xpositions.splice(index, 1);
    if (stacksSoFar.length >= n) {
      return stacksSoFar;
    } else {
      return makeStacks(stacks, n);
    }
  }
  
  var getStackInfo = function(stack) {
    var color = monoColor? stack[0].color : 'mixed';
    var height = stack[0].y - stack[stack.length-1].y + 2 * dim;
    return {blocks: stack,
            color: color,
            x: stack[0].x,
            height: height 
           }
  }
  
  var realStack = function(stack) {
    return stack.length >= 2; 
  }

  //// Make world ////

  var rawStacks = makeStacks([], numStacks);
  var blockList = rawStacks.flat();
  var rawStacks = filter(realStack, rawStacks);
  var stacks = map(getStackInfo, rawStacks);
  var world = {stacks: stacks,
               blocks: blockList,
               ground: ground,
               table: table,
               force: force()
              }
//   var world = [ground, table, force()].concat(blockList);
//   var world = [ground, table, force]
  return world;
}

editor.put("model", makeBlockWorld);
