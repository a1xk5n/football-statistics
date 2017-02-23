define(['knockout','jquery'], function(ko) {
    return function AppViewModel() {
    	let self = this;
    	let leaguesArr = [];
    	let leaguesArrTeams = [];
    	let loadingObj = {
    		id: 0,
    		name: 'loading'
    	}
    	let storageTeams = JSON.parse(localStorage.getItem('favoriteTeams'));
    	console.log(storageTeams);
    	location.hash = '';
    	self.icon = 'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg';
    	self.folders = ['League Table', 'Teams'];
    	self.chosenFolderId = ko.observable('League Table');
    	self.avaibleLeagues = ko.observableArray([loadingObj]);
    	self.leaguesTeams = ko.observableArray([loadingObj]);
    	self.leagueTitle = ko.observable('');
    	self.leagueTitleTeam = ko.observable('');
    	self.leagueList = ko.observableArray([]);
    	self.currentLeagueTeams = ko.observableArray([]);
    	self.favoriteTeams = ko.observableArray(storageTeams);
    	self.alert = function(folder) {
    		console.log(123)
    	}
    	self.goToFolder = function(folder) {
    		if(folder == 'League Table') {
    			folder = '';
    		}
    		if(folder instanceof Object) {
    			if(folder.teamName) {
    				let id = folder._links.team.href;
    				id = id.replace('http://api.football-data.org/v1/teams/','');
    				folder = id;
    			} else {
    				folder = '';
    			}
    		}
    		self.chosenFolderId(folder || 'League Table');
    		location.hash = folder;
    		console.log(folder)
    	}
    	self.changeLeagues = () => {
			let currentId = (getId(self.leagueTitle().name, leaguesArr));
			let leagueGroups = getLeagueInfo(currentId);
			leagueGroups.then(item => {
				self.leagueList(item.standing);
			});
		}

		self.changeLeagueTeams = () => {
			console.log(self.leagueTitleTeam())
			// let currentId = (getId(self.leagueTitleTeam().name, leaguesArr));
			let currentId = self.leagueTitleTeam().id;
			console.log(currentId)
			let leagueTeams = getLeagueTeams(currentId);
			leagueTeams.then(item => {
				item.teams.map(obj => {
					let id = obj._links.self.href;
					id = id.replace('http://api.football-data.org/v1/teams/','');
					obj.id = id;
				})
				console.log(item)
				self.currentLeagueTeams(item.teams)
				self.favoriteTeams().map(item => {
					let id = '#' + item;
					$(id).addClass('active');
				})
			})
		}
		self.addFavorite = function(id) {
			let id1 = '#' + id;
			$(id1).toggleClass('active');
			if(!self.favoriteTeams().includes(id)) {
				self.favoriteTeams().push(id)
			} else {
				let itemToDel = self.favoriteTeams.indexOf(id);
				self.favoriteTeams().splice(itemToDel, 1);
			}
			localStorage.setItem('favoriteTeams', JSON.stringify(self.favoriteTeams()));
			console.log(self.favoriteTeams())
		}
		let getLeagues = new Promise(function(resolve, reject) {
			let xhr = new XMLHttpRequest();
			let url = 'https://api.football-data.org/v1/competitions/?season=2016';
			xhr.open('GET', url, true);
			xhr.setRequestHeader('X-Auth-Token', 'bfd683e88b534ddebb373eb7daab0069');
			xhr.send();
			let requestResult;
			let res = [];
			xhr.onload = () => {
				let leaguesArr = [];
				requestResult = JSON.parse(xhr.responseText);
				requestResult.map((item) => {
					if(item.id != 432 && item.id != 424 && item.id != 440) {
						leaguesArr.push(new SimpleObj(item.id,(item.caption).substr(0, (item.caption).length - 7)));
					}
				});
				resolve(leaguesArr);
			}
		});

		getLeagues.then((item) => {
			leaguesArr = item;
			leaguesArr.map(item1 => {
				leaguesArrTeams.push(Object.assign({}, item1));
			})
			leaguesArrTeams.map(item2 => {
				item2.name = item2.name + 'teams';
			});
			self.avaibleLeagues(leaguesArr);
			self.leaguesTeams(leaguesArrTeams);
		});

	}

	function getId(name, array) {
		return (array.filter((item) => item.name == name))[0].id;
	}

	function SimpleObj(a, b) {
		this.id = a;
		this.name = b;
	}

	function getLeagueInfo(leagueId) {
		return new Promise(function(resolve, reject) {
			let requestResult;
			let xhr = new XMLHttpRequest();
			let url = 'https://api.football-data.org/v1/competitions/' + leagueId + '/leagueTable';
			xhr.open('GET', url, true);
			xhr.setRequestHeader('X-Auth-Token', 'bfd683e88b534ddebb373eb7daab0069');
			xhr.send();
			xhr.onload = () => {
				requestResult = JSON.parse(xhr.responseText);
				resolve(requestResult);
			}
		})
	}
	
	function getLeagueTeams(leagueId) {
		return new Promise(function(resolve, reject) {
			let requestResult;
			let xhr = new XMLHttpRequest();
			let url = 'https://api.football-data.org/v1/competitions/' + leagueId + '/teams';
			xhr.open('GET', url, true);
			xhr.setRequestHeader('X-Auth-Token', 'bfd683e88b534ddebb373eb7daab0069');
			xhr.send();
			xhr.onload = () => {
				requestResult = JSON.parse(xhr.responseText);
				resolve(requestResult);
			}
		})
	}
});




