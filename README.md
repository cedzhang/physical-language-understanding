# Physics language understanding

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
