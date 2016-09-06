function AjaxFetchQuizData(successCallback) {
	$.ajax({
	    type: "GET",
	    url: "https://proto.io/en/jobs/candidate-questions/quiz.json",
	    success: successCallback,
	    error: function() {
	    	// $quizError.show();
	    }
	});
}

function AjaxFetchResultData(successCallback) {
	$.ajax({
	    type: "GET",
	    url: "https://proto.io/en/jobs/candidate-questions/result.json",
	    success: successCallback,
	    error: function() {
	    	// $quizError.show();
	    }
	});
}