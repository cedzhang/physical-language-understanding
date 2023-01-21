"""
generate_stimuli.py | Generates paired language and  
"""
import csv, os, json, argparse, sys
import random

random.seed(0)

parser = argparse.ArgumentParser()

MAX_STIMULI_PER_SET = 10
EXPORT_FILE = "data/physics_stimuli.json"
IMAGINE_TABLE = "Imagine there is a table."
UNSPECIFIED_QUERY = "If the table is bumped hard enough to knock at least one of the blocks onto the floor, are there going to be more red blocks or yellow blocks on the floor?"

parser.add_argument(
    "--export_file", default=EXPORT_FILE, help="Where to save out the data.",
)

parser.add_argument(
    "--max_stimuli",
    default=MAX_STIMULI_PER_SET,
    help="If provided, maximum number of stimuli to sample in each set.",
)

TALL_STACK = "tall stack"
SHORT_STACK = "short stack"
UNSPECIFIED_STACK = "stack"

RED_BLOCKS = "of red blocks"
YELLOW_BLOCKS = "of yellow blocks"
UNSPECIFIED_BLOCKS = "of blocks"

LEFT_SIDE = ("on the left side of the table", "on the left of the table")
RIGHT_SIDE = ("on the right side of the table", "on the right of the table")
CENTER = ("in the middle of the table", "in the center of the table")

STIMULI_ID = "id"
STIMULUS_SET = "stimulus_set"
LANGUAGE = "language"
PROGRAM = "program"


def get_stimulus(language=None, program=None, stimulus_set=None):
    stimulus = {
        STIMULI_ID: "",
        LANGUAGE: language,
        PROGRAM: program,
        STIMULUS_SET: stimulus_set,
    }
    return stimulus


def generate_easy_two_stacks_quantifier_heights_stimuli(
    max_stimuli=MAX_STIMULI_PER_SET,
):
    stimuli_set_name = "easy_two_stacks_quantifier_heights"
    stimuli = []
    # There are two stacks of blocks. One of them is a tall stack of red blocks.
    stims_1 = []
    two_unspecified_stacks = "There are two stacks of blocks on the table."
    for size in [TALL_STACK, SHORT_STACK, UNSPECIFIED_STACK]:
        for color in [RED_BLOCKS, YELLOW_BLOCKS]:
            if size == UNSPECIFIED_STACK and color == UNSPECIFIED_BLOCKS:
                continue
            else:
                one_stack_is = random.choice(
                    ["One of them is", "One of the stacks is", "One is"]
                )
                specify_one_stack = f"{one_stack_is} a {size} {color}."
                language = " ".join(
                    [
                        IMAGINE_TABLE,
                        two_unspecified_stacks,
                        specify_one_stack,
                        UNSPECIFIED_QUERY,
                    ]
                )
            stims_1.append(
                get_stimulus(
                    language=language, program=None, stimulus_set=stimuli_set_name
                )
            )
    stimuli += random.sample(stims_1, min(len(stims_1), int(max_stimuli / 2)))

    # There is a tall stack of red blocks, and there is also a short stack of yellow blocks.
    stims_2 = []
    for size_1 in [TALL_STACK, SHORT_STACK, UNSPECIFIED_STACK]:
        for color_1 in [RED_BLOCKS, YELLOW_BLOCKS]:
            for size_2 in [TALL_STACK, SHORT_STACK, UNSPECIFIED_STACK]:
                for color_2 in [RED_BLOCKS, YELLOW_BLOCKS]:
                    if color_1 == color_2:
                        continue
                    elif size_1 == size_2 and color_1 == color_2:
                        language = " ".join(
                            [
                                IMAGINE_TABLE,
                                f"There are two {size_1}s {color_1} on the table.",
                                UNSPECIFIED_QUERY,
                            ]
                        )
                    else:
                        language = " ".join(
                            [
                                IMAGINE_TABLE,
                                f"There is a {size_1} {color_1} on the table, and there is also a {size_2} {color_2}.",
                                UNSPECIFIED_QUERY,
                            ]
                        )
                    stims_2.append(
                        get_stimulus(
                            language=language,
                            program=None,
                            stimulus_set=stimuli_set_name,
                        )
                    )
    stimuli += random.sample(stims_2, min(len(stims_2), int(max_stimuli / 2)))

    return {stimuli_set_name: stimuli}


def generate_one_stack_specified_location_stimuli(
    stimuli_set_name, query=UNSPECIFIED_QUERY,
):
    # There are two stacks of blocks. One of them is a tall stack of red blocks in the center of the table.
    stims_1 = []
    two_unspecified_stacks = "There are two stacks of blocks on the table."
    for size in [TALL_STACK, SHORT_STACK, UNSPECIFIED_STACK]:
        for color in [RED_BLOCKS, YELLOW_BLOCKS]:
            for location in [LEFT_SIDE, RIGHT_SIDE, CENTER]:
                if size == UNSPECIFIED_STACK and color == UNSPECIFIED_BLOCKS:
                    continue
                else:
                    one_stack_is = random.choice(
                        ["One of them is", "One of the stacks is", "One is"]
                    )

                    location = random.choice(location)
                    specify_one_stack = f"{one_stack_is} a {size} {color}, {location}."
                    language = " ".join(
                        [
                            IMAGINE_TABLE,
                            two_unspecified_stacks,
                            specify_one_stack,
                            query,
                        ]
                    )
                stims_1.append(
                    get_stimulus(
                        language=language, program=None, stimulus_set=stimuli_set_name
                    )
                )
    return stims_1


def generate_two_stack_specified_location_stimuli(
    stimuli_set_name, query=UNSPECIFIED_QUERY,
):
    stims_2 = []
    for size_1 in [TALL_STACK, SHORT_STACK, UNSPECIFIED_STACK]:
        for color_1 in [RED_BLOCKS, YELLOW_BLOCKS]:
            for location_1 in [LEFT_SIDE, RIGHT_SIDE, CENTER]:
                for size_2 in [TALL_STACK, SHORT_STACK, UNSPECIFIED_STACK]:
                    for color_2 in [RED_BLOCKS, YELLOW_BLOCKS]:
                        for location_2 in [LEFT_SIDE, RIGHT_SIDE, CENTER]:
                            if color_1 == color_2 or location_1 == location_2:
                                continue
                            else:

                                loc_1, loc_2 = (
                                    random.choice(location_1),
                                    random.choice(location_2),
                                )
                                language = " ".join(
                                    [
                                        IMAGINE_TABLE,
                                        f"There is a {size_1} {color_1} {loc_1}. There's also a {size_2} {color_2} {loc_2}.",
                                        UNSPECIFIED_QUERY,
                                    ]
                                )
                            stims_2.append(
                                get_stimulus(
                                    language=language,
                                    program=None,
                                    stimulus_set=stimuli_set_name,
                                )
                            )
    return stims_2


def generate_medium_two_stacks_quantifier_heights_location_stacks_stimuli(
    max_stimuli=MAX_STIMULI_PER_SET,
):
    stimuli_set_name = "medium_two_stacks_quantifier_heights_location_stacks"
    stimuli = []

    stims_1 = generate_one_stack_specified_location_stimuli(
        stimuli_set_name, query=UNSPECIFIED_QUERY,
    )
    stimuli += random.sample(stims_1, min(len(stims_1), int(max_stimuli / 2)))

    # There is a tall stack of red blocks in the center of the table, and there is also a short stack of yellow blocks in the center of the table.
    stims_2 = generate_two_stack_specified_location_stimuli(
        stimuli_set_name, query=UNSPECIFIED_QUERY,
    )
    stimuli += random.sample(stims_2, min(len(stims_2), int(max_stimuli / 2)))

    return {stimuli_set_name: stimuli}


def generate_hard_two_stacks_quantifier_heights_location_stacks_stimuli(
    max_stimuli=MAX_STIMULI_PER_SET,
):
    stimuli_set_name = "hard_two_stacks_quantifier_heights_location_stacks_stimuli"
    stimuli = []

    stims_1 = []
    LOCATION_QUERY = "If the table is bumped hard enough {} to knock at least one of the blocks onto the floor, are there going to be more red blocks or yellow blocks on the floor?"
    for bump_location in ["from the left", "from the right"]:
        location_query = LOCATION_QUERY.format(bump_location)
        stims_1 += generate_one_stack_specified_location_stimuli(
            stimuli_set_name, query=location_query,
        )
    stimuli += random.sample(stims_1, min(len(stims_1), int(max_stimuli / 2)))

    # There is a tall stack of red blocks in the center of the table, and there is also a short stack of yellow blocks in the center of the table.
    stims_2 = []
    for bump_location in ["from the left", "from the right"]:
        location_query = LOCATION_QUERY.format(bump_location)
        stims_2 += generate_one_stack_specified_location_stimuli(
            stimuli_set_name, query=location_query,
        )
    stimuli += random.sample(stims_2, min(len(stims_2), int(max_stimuli / 2)))

    return {stimuli_set_name: stimuli}


def export_stimuli(args, all_stimuli):
    # Assign unique stimulus ID.
    global_id = 0
    for k in all_stimuli:
        for v in all_stimuli[k]:
            v[STIMULI_ID] = global_id
            global_id += 1
    with open(args.export_file, "w") as f:
        json.dump(all_stimuli, f)


def main(args):

    all_stimuli = dict()
    all_stimuli.update(
        generate_easy_two_stacks_quantifier_heights_stimuli(args.max_stimuli)
    )
    all_stimuli.update(
        generate_medium_two_stacks_quantifier_heights_location_stacks_stimuli(
            args.max_stimuli
        )
    )
    all_stimuli.update(
        generate_hard_two_stacks_quantifier_heights_location_stacks_stimuli(
            args.max_stimuli
        )
    )
    export_stimuli(args, all_stimuli)


if __name__ == "__main__":
    args = parser.parse_args()
    main(args)
