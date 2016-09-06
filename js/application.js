$(document).ready(function () {

// ******* GLOBAL VARIABLES *******
	var gv = this;
// ********************************


// ******* FETCH DATA WITH AJAX CALL *******
	AjaxFetchQuizData(function successCallback(quizData) {
		startQuiz(quizData);
	});
// *****************************************


	function startQuiz(data) {
		gv.data = data;
		gv.currentQuestion = 0;
		gv.userScore = 0;
		gv.maxScore = 0;
		gv.userScorePercent = 0;
		gv.totalNumOfQuestions = gv.data.questions.length;

		setTitleInformations();
		setFirstQuestion();
		showFirstQuestion();

	}

	// ******* EVENTS *******

	$( '.quiz__next-question-btn' ).on( 'click', validateAnswerAndSetNextQuestion );	

	// ******* FUNCTIONS *******

	function setTitleInformations() {
		var title = gv.data.title, 
				description = gv.data.description;

		$('.quiz__title').text(title);
		$('.quiz__description').text(description);
	}

	function setFirstQuestion() {
		setQuestion(gv.currentQuestion);
		$('.quiz__q-total-num').text(gv.totalNumOfQuestions);
	}

	function showFirstQuestion() {
		setTimeout(function() {
			$( '.quiz').fadeIn(1000, 'linear');
    }, 1000);
	}

			//**** Set Question and it's connected functions *****

	function setQuestion(positionInRow) {
		var questionData = gv.data.questions[positionInRow],
				qId = questionData.q_id,
				question = questionData.title,
				qImg = questionData.img,
				qType = questionData.question_type,
				qAnswers = questionData.possible_answers;

		$('.quiz__q-id').text(qId);
		$('.quiz__question').text(question);
		$('.quiz__q-img').attr('src', qImg);
		
		answersDependingOnType(qType, qAnswers);

		//if it's the last question, change text in button
		if ( (positionInRow + 1) === gv.totalNumOfQuestions) {
			$('.quiz__next-question-btn').text('FINAL SCORE');
		}
	}

	function answersDependingOnType(type, answers) {
		var $answersWrapper = $('.quiz__q-answers-wrapper'),
				$answers = $('<ul>').addClass('quiz__q-answers');

		if(type === 'mutiplechoice-single') {
			multipleChoice('single', answers, $answersWrapper, $answers);
		} else if (type === 'mutiplechoice-multiple') {
			multipleChoice('multiple', answers, $answersWrapper, $answers);
		} else {
			trueOrFalse($answersWrapper, $answers);
		} 
	}

	function multipleChoice(choice, answers, $answersWrapper, $answers) {
		var inputType = (choice === 'single') ? 'radio' : 'checkbox';

		$.each(answers, function(i, answer) { 
			var $label = $('<label>').text(answer.caption).attr({for: 'answer'+ i}),
					$input = $('<input>').attr({type: inputType, name: 'answer', value: answer.a_id, id: 'answer'+ i}),
			  	$oneAnswer = $('<li>').addClass(inputType + ' ' + inputType + '-primary').append($input).append($label);
			  	
			$answers.append($oneAnswer);
		});
		$answersWrapper.html($answers);
	}

	function trueOrFalse($answersWrapper, $answers) {
		var $trueAnswer = $('<li>')
											.addClass('radio radio-primary radio-inline')
											.append($('<input>').attr({type: 'radio', name: 'answer', value: 'true', id: 'answer1'}))
											.append($('<label>').text("True").attr({for: 'answer1'})),											
				$falseAnswer = $('<li>')
											.addClass('radio radio-primary radio-inline')
											.append($('<input>').attr({type: 'radio', name: 'answer', value: 'false', id: 'answer2'}))
											.append($('<label>').text("False").attr({for: 'answer2'}));

		$answers.append($trueAnswer)
						.append($falseAnswer);
		$answersWrapper.html($answers);		
	}

	//------------------------------------------


		//**** validate answer/set next question and it's connected functions *****

	function validateAnswerAndSetNextQuestion() {
		if ( answerProvided() ) {
			disableNextQuestionButton(); // prevents user of clicking button/starting event again, until new question comes 
			validateAnswers();
			gv.currentQuestion += 1;

			swordAnimationStart();
			//after 3 seconds show the next question or the final result
			setTimeout(function() {
				if (gv.currentQuestion < gv.totalNumOfQuestions) {
					setQuestion(gv.currentQuestion);
					enableNextQuestionButtonAgain(); 
		  	} else {
		  		showFinalResult();
		  	}
		  	swordAnimationFinish();
	  	}, 3000);


		} else {
			$('.quiz__answer-not-provided').show();
		}
	}

	function answerProvided() {
    if ( $('.quiz__q-answers input').is(':checked') ) {
    	$('.quiz__answer-not-provided').hide();
      return true;
    } else {
    	return false;
    }
	}

	function disableNextQuestionButton() {
		$('.quiz__next-question-btn').off();
	}

	function enableNextQuestionButtonAgain() {
		$('.quiz__next-question-btn').on('click', validateAnswerAndSetNextQuestion );
	}

	function validateAnswers() {
		var questionData = gv.data.questions[gv.currentQuestion],
				qType = questionData.question_type,
				qCorrectAnswer = questionData.correct_answer,
				qPoints = questionData.points;

		gv.maxScore += qPoints;

		if(qType === 'mutiplechoice-single') {
			validateSingleAnswer(qCorrectAnswer, qPoints);
		} else if (qType === 'mutiplechoice-multiple') {
			validateMultipleAnswer(qCorrectAnswer, qPoints);
		} else {
			validateTrueFalseAnswer(qCorrectAnswer, qPoints);
		}
	}

	function validateSingleAnswer(correctAnswer, points) {
		var userAnswer = parseInt( $('.quiz__q-answers input:checked').val() );

		addPointsOrDisplayCorrectAnswer (userAnswer, correctAnswer, points);
	}

	function validateMultipleAnswer(correctAnswer, points) {
		var userAnswer = $.map($('.quiz__q-answers input:checkbox:checked'), function(e,i) {
    	return +e.value;
		});

		//sort arrays in asc order
		correctAnswer =_.orderBy(correctAnswer, [], ['asc']);
		userAnswer = _.orderBy(userAnswer, [], ['asc']);

		addPointsOrDisplayCorrectAnswer (userAnswer, correctAnswer, points);
	}

	function validateTrueFalseAnswer(correctAnswer, points) {
		var userAnswer = $('.quiz__q-answers input:checked').val();  //returns boolean value like a string
		userAnswer = (userAnswer === 'true'); // boolean value - not string anymore

		addPointsOrDisplayCorrectAnswer (userAnswer, correctAnswer, points);
	}

	function addPointsOrDisplayCorrectAnswer(userAnswer, correctAnswer, points) {
		if ( _.isEqual(userAnswer, correctAnswer) ) {
			gv.userScore += points;
		} else {
			highlightCorrectAnswers(correctAnswer); 
		}
	}

	function highlightCorrectAnswers(correctAnswer) {
		//if it's an array, iterate through it
		if (correctAnswer.length > 1) {
			_.forEach(correctAnswer, function(value) {
				highlightThisAnswer(value);
			});
		} else {
			highlightThisAnswer(correctAnswer);
		}
	}

	function highlightThisAnswer(answer) {
		$('.quiz__q-answers input[value=' + answer +']' ).closest('li').addClass('quiz__highlighted-answer');
	}

	function swordAnimationStart() {
		var randNum = Math.ceil(23 * Math.random());

		$('.quiz__small-sword').addClass('-animate');
		$('.quiz__cost-of-arms').css('background', 'url("../pics/icons/' + randNum + '.png") no-repeat');
		$('.quiz__cost-of-arms').show();
	}

	function swordAnimationFinish() {
		$('.quiz__small-sword').removeClass('-animate');
		$('.quiz__cost-of-arms').hide();
	}

	// -----------------------------------------



	function showFinalResult() {

		AjaxFetchResultData(function successCallback(resultData) {
			setResult(resultData);
			
			$('.quiz').fadeOut(1000, 'linear');
			
			setTimeout(function() {
				$('.result').fadeIn(1000, 'linear');
		  }, 1200);	
		});

	}

	function setResult(resultData) {
		var userScorePercent = Math.round(gv.userScore / gv.maxScore * 100);

		var userResult = _.find(resultData.results, function(result) { 
			return (result.minpoints <= userScorePercent) && (userScorePercent <= result.maxpoints); 
		});

		$('.result__percentage').text(userScorePercent);
		$('.result__img').attr('src', userResult.img);
		$('.result__title').text(userResult.title);
		$('.result__msg').text(userResult.message);
	}
	
});
 
