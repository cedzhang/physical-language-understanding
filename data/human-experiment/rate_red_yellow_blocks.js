var timeline = []

// help from: https://www.jspsych.org/overview/prolific/
var subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
var study_id = jsPsych.data.getURLVariable('STUDY_ID');
var session_id = jsPsych.data.getURLVariable('SESSION_ID');

jsPsych.data.addProperties({
    subject_id: subject_id,
    study_id: study_id,
    session_id: session_id
});

var scale = [
    "Definitely more red blocks",
    "Most likely to be more red blocks",
    "Somewhat likely to be more red blocks",
    "Equally likely to be more red or more yellow",
    "Somewhat likely to be more yellow blocks",
    "Most likely to be more yellow blocks",
    "Definitely more yellow blocks"
]

var instructions = {
    type: "instructions",
    pages: ['<p> Welcome! </p> <p> We are conducting an experiment about how people understand language about simple situations in the world. Your answers will be used to inform computer science and cognitive science research.</p>' +
        '<p> This experiment should take at most <strong>10 minutes</strong>. </br></br> You will be compensated at a base rate of $15.00/hour for a total of <strong>$2.50</strong>, which you will receive as long as you complete the study.</p>',
        '<p> We take your compensation and time seriously! The email for the main experimenter is <strong>cedzhang@mit.edu</strong>. </br></br> Please write this down now, and email us with your Prolific ID and the subject line <i>Human experiment compensation for language experiment</i> if you have problems submitting this task, or if it takes much more time than expected. </p>',
    '<p>In this experiment, you will be reading a series of simple descriptions about <strong>a table with some blocks on it.</strong></p>' +
    '<p>The blocks can be either red or yellow.</p>' +
    '<p>In each situation, you will be asked to imagine the table based on the description, and then imagine that the <strong>table is bumped hard enough to knock at least one of the blocks onto the floor.</strong></p>',
    '<p>Your task will be to think about whether, after the bump, there will be <strong>more red or yellow blocks</strong> on the floor.' +
    '<p>You will enter your answer for each question by clicking a rating on a <strong>7-point multiple choice scale</strong> ranging from <strong>1 (definitely more red blocks)</strong> to <strong>7 (definitely more yellow blocks)</strong>.',

    '<p>You will see descriptions of <strong>10 different scenarios</strong> in total.</p>' +

    '<p> When you are ready, please click <strong>\"Next\"</strong> to complete a quick comprehension check, before moving on to the experiment. </p>'],
    show_clickable_nav: true
};

var comprehension_check = {
    type: "survey-multi-choice",
    preamble: ["<p align='center'>Check your knowledge before you begin. If you don't know the answers, don't worry; we will show you the instructions again.</p>"],
    questions: [
        {
            prompt: "What will you be asked to do in this task?",
            options: ["Read descriptions about a table and answer a question about whether there are more red or yellow blocks on the table in the beginning.", "Read descriptions about a table and answer a question about whether there will be more red or yellow blocks on the table after it is bumped.", "Read descriptions about a table and answer a question about whether there will be more red or yellow blocks on the floor after it is bumped."],
            required: true
        },
        {
            prompt: "How will you be providing your answer?</i>",
            options: ["By writing text.", "By selecting an option from a multiple choice scale.", "By moving a slider."],
            required: true
        },
    ],
    on_finish: function (data) {
        var responses = data.response;

        if (responses['Q0'] == "Read descriptions about a table and answer a question about whether there will be more red or yellow blocks on the floor after it is bumped." && responses['Q1'] == "By selecting an option from a multiple choice scale.") {
            familiarization_check_correct = true;
        } else {
            familiarization_check_correct = false;
        }
    }
}

var familiarization_timeline = [instructions, comprehension_check]

var familiarization_loop = {
    timeline: familiarization_timeline,
    loop_function: function (data) {
        return !familiarization_check_correct;
    }
}

timeline.push(familiarization_loop)

var final_instructions = {
    type: "instructions",
    pages: ['<p> Now you are ready to begin! </p>' +
        '<p> Please click <strong>\"Next\"</strong> to start the experiment. Thank you for participating in our study! </p>'],
    show_clickable_nav: true
};
timeline.push(final_instructions)



// Get which set of stimuli to see and stuffle them.
var condition_num = CONDITION - 1
var stimulus_set = Object.keys(all_stimuli)[condition_num]
var stimuli_batch = all_stimuli[stimulus_set]
stimuli_batch = jsPsych.randomization.shuffle(stimuli_batch)
var progress_bar_increase = 1 / (stimuli_batch.length)
for (var i = 0; i < stimuli_batch.length; i++) {
    var stimulus = stimuli_batch[i]
    var rating_page = {
        type: 'survey-likert',
        questions: [
            {
                prompt: function () {

                    var scenario = stimulus["language"]


                    return "<p>" + scenario + "</p>" +

                        '</p><p></p>' +
                        '<br></br><p>'
                },
                name: "red_yellow", labels: scale, required: true,
            }
        ],
        randomize_question_order: false,
    };

    var rating_task = {
        timeline: [rating_page],
        data: {
            prompt: stimulus["language"],
            task: 'rate_red_yellow_blocks',
            subj_id: jsPsych.timelineVariable('id'),
            stimulus_set: stimulus_set,
        },
        on_finish: function () {
            var curr_progress_bar_value = jsPsych.getProgressBarCompleted();
            jsPsych.setProgressBar(curr_progress_bar_value + progress_bar_increase);
        }
    }
    timeline.push(rating_task);
}




var comments_block = {
    type: "survey-text",
    preamble: "<p>Thank you for participating in our study!</p>" +
        "<p>Click <strong>\"Finish\"</strong> to complete the experiment and receive compensation. If you have any comments about the experiment, please let us know in the form below.</p>",
    questions: [
        { prompt: "Were the instructions clear? (On a scale of 1-10, with 10 being very clear)" },
        { prompt: "How challenging was it to come up with a rating per explanation? (On a scale of 1-10, with 10 being very challenging)" },
        { prompt: "Were there any particular qualities of explanations you looked to when deciding if a explanation was good?", rows: 5, columns: 50 },
        { prompt: "Do you have any additional comments to share with us?", rows: 5, columns: 50 }],
    button_label: "Finish",
};
timeline.push(comments_block)

// TODO: CHANGE COMPLETION CODE
jsPsych.init({
    timeline: timeline,
    on_finish: function () {
        // send back to main prolific link
        // window.location = "https://www.google.com/"
        window.location = "https://app.prolific.co/submissions/complete?cc=69A40EE2"
    },
    show_progress_bar: true,
    auto_update_progress_bar: false
});