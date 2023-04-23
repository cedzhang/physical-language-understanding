# Physical language understanding


**(1) We start with a scenario in language...**
> Imagine there is a table, and there are some blocks on the table. There is one tall stack of red blocks, and there are two short stacks of yellow blocks. If the table is bumped hard enough to knock at least one of the blocks onto the floor, are there going to be more red blocks or yellow blocks on the floor?

**(2) That translates into probabilistic programming code...**
```
// There is one tall stack of red blocks.
condition(filter(isTall, filter(isRed, world.stacks)).length == 1);

// There are two short stacks of yellow blocks.
condition(filter(isShort, filter(isYellow, world.stacks)).length == 2);
```

**(3) Which generates physical simulations...**

https://user-images.githubusercontent.com/10052880/217621629-1ac794ff-cde9-459c-a90b-22257159ff7d.mov

**(4) To answer the question...**
> "Are there going to be more red blocks or yellow blocks on the floor?
> 
<pre>
<b>PiLoT model answer:</b>
1 - Definitely more red blocks (2%)
2 - Very likely more red blocks (16%)
<b>3 - Somewhat likely more red blocks (42%)</b>
4 - Equally likely more red or more yellow blocks (28%)
5 - Somewhat likely more yellow blocks (10%)
6 - Very likely more yellow blocks (2%)
7 - Definitely more yellow blocks (0%)
</pre>

---

## Setup
1. Install NodeJS via the conda environment
```
conda env create -f environment.yml
conda activate physlang
```

2. Test the generative model
```
webppl webppl/generative_model.js --require physics
```

## Running Codex prompting

See `prompting/codex_prompting.ipynb` for details. Running this notebook will produce a unique `experiment_id` and associated directory in `experiments/` to store Codex-generated `condition` statements and other outputs.

## Running the simulator

The simulator takes as input a set of Codex-generated condition statements. These are given by the provided `experiment_id`, which is the name of a directory in `experiments/` (e.g., `run-2023-01-27-11-52-34`).

```
cd webppl
python run_simulator.py <experiment_id> --n_participants 20 --n_simulations 10 --timeout 240
```
