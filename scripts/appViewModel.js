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
        location.hash = '';
        
        self.folders = ['League Table', 'Teams'];
        self.chosenFolderId = ko.observable('League Table');
        self.avaibleLeagues = ko.observableArray([loadingObj]);
        self.leaguesTeams = ko.observableArray([loadingObj]);
        self.leagueTitle = ko.observable('');
        self.leagueTitleTeam = ko.observable('');
        self.leagueList = ko.observableArray([]);
        self.currentLeagueTeams = ko.observableArray([]);
        self.favoriteTeams = ko.observableArray(storageTeams);
        self.teamsForFavoriteTable = ko.observableArray([]);
        fillFavoriteTeamsTable(self.favoriteTeams());
        self.currentTeamId = ko.observable();
        self.currentTeamName = ko.observable('');
        self.tabs = ['Info', 'Fixtures'];
        self.chosenTab = ko.observable('Info');
        self.currentTeamPages = ko.observableArray([]);
        self.currentTeamPlayers = ko.observableArray([]);
        self.chosenPage = ko.observable(1);
        self.changeTab = function(tabName) {
            self.chosenTab(tabName);
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
            if(!isNaN(folder) && folder != '') {
                self.currentTeamId(folder);
                let getName = getInfo(self.currentTeamId(), 'teams/', '');
                getName.then(item => self.currentTeamName(item.name));
                loadAndFillPlayersInfo(self.currentTeamId());
            }
        }
        self.changeLeagues = () => {
            let currentId = getId(self.leagueTitle().name, leaguesArr)
            let leagueGroups = getInfo(currentId, 'competitions/' ,'/leagueTable');
            leagueGroups.then(item => {
                self.leagueList(item.standing);
            });
        }

        self.changeLeagueTeams = () => {
            let currentId = self.leagueTitleTeam().id;
            let leagueTeams = getInfo(currentId, 'competitions/','/teams');
            leagueTeams.then(item => {
                item.teams.map(obj => {
                    let id = obj._links.self.href;
                    id = id.replace('http://api.football-data.org/v1/teams/','');
                    obj.id = id;
                })
                self.currentLeagueTeams(item.teams)
                self.favoriteTeams().map(item => {
                    let id = '#' + item;
                    $(id).addClass('active');
                })
            })
        }
        self.addFavorite = function(id,name) {
            let id1 = '#' + id;
            $(id1).toggleClass('active');
            if(!self.favoriteTeams().includes(id)) {
                self.favoriteTeams().push(id);
                self.favoriteTeams().push(name);
            } else {
                let itemToDel = self.favoriteTeams.indexOf(id);
                self.favoriteTeams().splice(itemToDel, 2);
            }
            localStorage.setItem('favoriteTeams', JSON.stringify(self.favoriteTeams()));
            fillFavoriteTeamsTable(self.favoriteTeams())
        }
        self.removeFavorite = function(id) {
            let id1 = 'favorite' + id;
            $('#' + id1).removeClass('active');
            let itemToDel = self.favoriteTeams.indexOf(id1);
            self.favoriteTeams().splice(itemToDel, 2);
            fillFavoriteTeamsTable(self.favoriteTeams());
            localStorage.setItem('favoriteTeams', JSON.stringify(self.favoriteTeams()));
        }
        self.goToPage = function(page) {
            self.chosenPage(page);
            let needPos = -1191 * (+self.chosenPage() - 1);
            $('.team-squad__players-list').css( {
                'transform' : 'translateY(' + needPos +'px)' 
            });
            if(self.chosenPage() == self.currentTeamPages().length) {
                let lengthDifference = self.currentTeamPages().length * 10 - self.currentTeamPlayers().length;
                $('.bottom').css({
                    'top' : '-' + (lengthDifference * 119) + 'px' 
                });
            } else {
                $('.bottom').css({
                    'top' : '0' 
                });
            }
        }
        function fillFavoriteTeamsTable(array) {
            let arrObj = [];
            array.map( (item, index, currArray) => {
                if(index %2 != 0) {
                    arrObj.push(new SimpleObj(currArray[index - 1].replace('favorite', ''), item))
                }
            })
            self.teamsForFavoriteTable(arrObj)
        }

        let getLeagues = getInfo('?season=2016', 'competitions/', '')
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

        function loadAndFillPlayersInfo(id) {
            let playersRequest = getInfo(id, 'teams/', '/players');
            let playersCount;
            let playersArr;
            let pageAmount;
            let pageArr;
            playersRequest.then(response =>{
                playersCount = response.count;
                playersArr = response.players.sort((a, b) => a.jerseyNumber - b.jerseyNumber);
                pageAmount = Math.ceil(playersCount / 10);
                pageArr = Array.apply(null, {length: pageAmount}).map(Number.call, Number).map(item => item + 1);
                self.currentTeamPages(pageArr);
                self.currentTeamPlayers(playersArr);
            });
        }

    }

    function getId(name, array) {
        return (array.filter((item) => item.name == name))[0].id;
    }

    function SimpleObj(a, b) {
        this.id = a;
        this.name = b;
    }

    function getInfo(id, section ,needUrl) {
        return new Promise(function(resolve, reject) {
            let requestResult;
            let xhr = new XMLHttpRequest();
            let url = 'https://api.football-data.org/v1/' + section + id + needUrl;
            xhr.open('GET', url, true);
            xhr.setRequestHeader('X-Auth-Token', 'bfd683e88b534ddebb373eb7daab0069');
            xhr.send();     
            xhr.onload = () => {
                if(id == '?season=2016') {
                    let leaguesArr = [];
                    requestResult = JSON.parse(xhr.responseText);
                    requestResult.map((item) => {
                        if(item.id != 432 && item.id != 424 && item.id != 440) {
                            leaguesArr.push(new SimpleObj(item.id,(item.caption).substr(0, (item.caption).length - 7)));
                        }
                    });
                    resolve(leaguesArr);
                } else {
                    requestResult = JSON.parse(xhr.responseText);
                    resolve(requestResult);
                }
            }
        })
    }


});




