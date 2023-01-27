/**
 * WebPPL generative model of a blockworld.
 */
var makeBlockWorld = function () {

    //// Distributions and parameters ////
    var truncGeom = function (p, m, n) {
        if (m > n) {
            return uniformDraw(_.range(1, n + 1));
        } else {
            return flip(p) ? truncGeom(p, m + 1, n) : m;
        }
    }

    var dim = 10;
    var tableSize = 100;
    var color = function () { return flip() ? 'red' : 'yellow' };
    var monoColor = flip();
    var stackHeight = function () { return truncGeom(0.5, 1, 8) };
    var numStacks = truncGeom(0.5, 1, 8);
    var xpositions = _.range(worldWidth / 2 - tableSize, worldWidth / 2 + tableSize + 20, 20);

    //// Object definitions ////
    var ground = {
        shape: 'rect',
        static: true,
        dims: [100000 * worldWidth, 10],
        x: worldWidth / 2,
        y: worldHeight
    }

    var table = {
        shape: 'rect',
        static: false,
        dims: [tableSize, tableSize],
        x: worldWidth / 2,
        y: 390,
        color: 'blue'
    }

    var force = function () {
        var left = flip();
        return {
            shape: 'square',
            static: false,
            dims: [uniformDraw([15, 16, 17, 18])],
            x: left ? 100 : worldWidth - 100,
            y: 310,
            color: 'green',
            velocity: left ? [10000, 0] : [-10000, 0]
        }
    }

    //// Make stacks ////
    var xposOnTable = function (options) {
        return uniformDraw(options);
    }

    var xpos = function (prevBlock) {
        return prevBlock.x
    }

    var ypos = function (prevBlock, h) {
        var prevY = prevBlock.y;
        var prevH = prevBlock.dims[1];
        return prevY - (prevH + h)
    }

    var addBlock = function (prevBlock, isFirst) {
        var xposition = xposOnTable(xpositions);
        if (isFirst) {
            var index = xpositions.indexOf(xposition);
            xpositions.splice(index, 1);
        }
        return {
            shape: 'rect',
            color: isFirst || !monoColor ? color() : prevBlock.color,
            static: false,
            dims: [dim, dim],
            x: isFirst ? xposition : xpos(prevBlock),
            y: ypos(prevBlock, dim)
        }
    }

    var stack = function (stackSoFar, h) {
        var newBlock = addBlock(stackSoFar[stackSoFar.length - 1], false);
        var theStack = stackSoFar.concat(newBlock);
        if (stackSoFar.length >= h) {
            return stackSoFar;
        } else {
            return stack(theStack, h);
        }
    }

    var makeStacks = function (stacksSoFar, n) {
        var height = stackHeight();
        var newStack = stack([addBlock(table, true)], height);
        var stacks = stacksSoFar.concat([newStack]);
        if (stacksSoFar.length >= n) {
            return stacksSoFar;
        } else {
            return makeStacks(stacks, n);
        }
    }

    var getStackInfo = function (stack) {
        var color = monoColor ? stack[0].color : 'mixed';
        var height = stack[0].y - stack[stack.length - 1].y + 2 * dim;
        return {
            blocks: stack,
            color: color,
            x: stack[0].x,
            height: height
        }
    }

    var realStack = function (stack) {
        return stack.length >= 2;
    }

    //// Make world ////
    var rawStacks = makeStacks([], numStacks);
    var blockList = rawStacks.flat();
    var rawStacks = filter(realStack, rawStacks);
    var stacks = map(getStackInfo, rawStacks);
    var world = {
        stacks: stacks,
        blocks: blockList,
        ground: ground,
        table: table,
        force: force()
    }
    return world;
}

/**
 * Example:
 * There is a stack of yellow blocks on the left side of the table, and there are a few red blocks on the middle of the table.
 */

// There is a stack of yellow blocks on the left side of the table.
condition(filter(isYellow, filter(isOnLeft, world.stacks)).length == 1);

// There are a few red blocks on the middle of the table.
condition(filter(isOnMiddle, filter(isRed, world.blocks)).length > 0 && filter(isOnMiddle, filter(isRed, world.blocks)).length <= 3);

/**
 * Example:
 * There is a tall stack of yellow blocks on the middle of the table, and there are some red blocks near the yellow stack.
 */

// There is a tall stack of yellow blocks on the middle of the table.
condition(filter(isTall, filter(isOnMiddle, filter(isYellow, world.stacks))).length == 1);

// There are some red blocks near the yellow stack.
condition(filter(isRed, filter(isNear(filter(isTall, filter(isOnMiddle, filter(isYellow, world.stacks)))[0]), world.blocks)).length > 0);

/**
 * Example:
 * Half of the blocks are red, and half of the blocks are yellow.
 */

// Half of the blocks are red.
condition(filter(isRed, world.blocks).length == world.blocks.length / 2);

// Half of the blocks are yellow.
condition(filter(isYellow, world.blocks).length == world.blocks.length / 2);

/**
 * Example:
 * There are several stacks of yellow blocks, and there is one stack of red blocks.
 */

// There are several stacks of yellow blocks.
condition(filter(isYellow, world.stacks).length > 1 && filter(isYellow, world.stacks).length < 5);

// There is one stack of red blocks.
condition(filter(isRed, world.stacks).length == 1);

/**
 * Example:
 * There are two stacks of yellow blocks on the left side of the table, and there are also two stacks of red blocks on the right side of the table.
 */

// There are two stacks of yellow blocks on the left side of the table.
condition(filter(isOnLeft, (filter(isYellow, world.stacks))).length == 2);

// There are also two stacks of red blocks on the right side of the table.
condition(filter(isOnRight, (filter(isRed, world.stacks))).length == 2);

/**
 * Example:
 * There are two stacks of yellow blocks on the left side of the table, and there are also two stacks of red blocks on the right side.
 * The table is bumped from the left.
 */

// There are two stacks of yellow blocks on the left side of the table.
condition(filter(isOnLeft, (filter(isYellow, world.stacks))).length == 2);

// There are also two stacks of red blocks on the right side.
condition(filter(isOnRight, (filter(isRed, world.stacks))).length == 2);

// The table is bumped from the left.
condition(isOnLeft(world.force));

/**
 * Example:
 * There is a short stack of red blocks, and there is a tall stack of yellow blocks near the red stack.
 */

// There is a short stack of red blocks.
condition(filter(isShort, filter(isRed, world.stacks)).length == 1);

// There is a tall stack of yellow blocks near the red stack.
condition(filter(isTall, filter(isYellow, filter(isNear(filter(isShort, filter(isRed, world.stacks))[0]), world.stacks))).length == 1);

/**
 * Example:
 * There are many stacks of blocks on the table.
 * All of the blocks are the right side are red, and most of the blocks on the left side are yellow.
 */

// There are many stacks of blocks on the table.
condition(world.stacks.length > 4);

// All of the blocks are the right side are red.
condition(all(isRed, filter(isOnRight, world.blocks)));

// Most of the blocks on the left side are yellow.
condition(filter(isYellow, filter(isOnLeft, world.blocks)).length > filter(isOnLeft, world.blocks).length / 2);

/**
 * Example:
 * There are more yellow blocks than red blocks on the table, and there are more red blocks than yellow blocks on the edges of the table.
 */

// There are more yellow blocks than red blocks on the table.
condition(filter(isRed, world.blocks).length > 0 && filter(isRed, world.blocks).length < filter(isYellow, world.blocks).length);

// There are more red blocks than yellow blocks on the edges of the table.
condition(filter(isOnEdge, filter(isRed, world.blocks)).length > filter(isOnEdge, filter(isYellow, world.blocks)).length);

/**
 * Example:
 * There are a short stack of red blocks on the left side of the table, and there is a tall stack of yellow blocks on the right side.
 * The table is bumped from the left.
 */

// There are a short stack of red blocks on the left side of the table.
condition(filter(isShort, filter(isOnLeft, (filter(isRed, world.stacks)))).length == 1);

// There is a tall stack of yellow blocks on the right side.
condition(filter(isTall, filter(isOnRight, (filter(isYellow, world.stacks)))).length == 1);

// The table is bumped from the left.
condition(isOnLeft(world.force));