# Physical language understanding

## Running WebPPL physics simulations via CLI
1. Install NodeJS via the conda environment
```
conda env create -f environment.yml
conda activate physlang
```

2. Run the generative model
```
webppl webppl/generative_model.js --require physics
```