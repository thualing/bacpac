$(document).ready(function () {
	/* ---------- Datable ---------- */
	$('.datatable').dataTable({
	    "sDom": "<'row'<'col-lg-6'l><'col-lg-6'f>r>t<'row'<'col-lg-12'i><'col-lg-12 center'p>>",
	    "sPaginationType": "bootstrap",
	   
		"oLanguage": {
			"sLengthMenu": "_MENU_ records per page"
		}

	});
	$("#btn1").on("click", function () {
	    alert("I Pushed this button!");
	});

});
