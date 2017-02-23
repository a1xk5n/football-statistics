require.config({
	paths: {
		'knockout' : '../node_modules/knockout/build/output/knockout-latest',
		'appViewModel' : 'appViewModel',
		'jquery' : '../node_modules/jquery/dist/jquery.min',
		'sammy' : '../node_modules/sammy/lib/sammy',
	},
	shim: {
        "sammy": {
			deps: ["jquery"],
			exports: "sammy",
        },
    }
})



require(['knockout', 'appViewModel'], function(ko, appViewModel) {
	if(!localStorage.getItem('favoriteTeams')) {
		localStorage.setItem('favoriteTeams', JSON.stringify([]));
	}
    ko.applyBindings(new appViewModel());
});

require(['sammy'], function(sammy) {
		
		var app = sammy(function() {
			this.get('/#', function() {
				$('.home-page').fadeIn();
				$('.teams-page').fadeOut();
			});
			this.get('/#Teams', function() {
				
				$('.teams-page').fadeIn();
				$('.home-page').fadeOut();
			});
			this.get('#:id', function() {
				console.log(this.params.id)
			})
			this.get('', function() { this.app.runRoute('get', '/#') });
		});

	$(function() {
		app.run();
	});
})




