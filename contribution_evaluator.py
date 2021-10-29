import pymysql
import json
import datetime
import GITHUBDB

githubDB = pymysql.connect(
    user=GITHUBDB.SQL_USER,
    password=GITHUBDB.SQL_PW,
    host = GITHUBDB.SQL_HOST,
    port=GITHUBDB.SQL_PORT,
    db=GITHUBDB.SQL_DB,
)
class Contributor:
    def __init__(self, stats):
        self.stars = stats["stars"]
        self.followers= stats["followers"]
        self.followings=stats["followings"] 
        self.total_repos=stats["total_repos"] 
        self.total_commits = stats["total_commits"]
        self.total_PRs = int(stats["total_PRs"])
        self.total_issues = int(stats["total_issues"])
        self.achievements = stats["achievements"]
        self.highlights = stats["highlights"]
        self.indie_repositories = []
        self.team_repositories = []
        self.owner_repositories = []
        self.contributor_repositories = []

        self.indie_stargazers_count = 0
        self.indie_forks_count = 0
        self.indie_commits_count = 0
        self.indie_code_edits = 0
        self.indie_prs_count = 0
        self.indie_open_issue_count = 0
        self.indie_close_issue_count = 0
        self.indie_watchers_count = 0
        self.indie_dependencies = 0
        self.indie_contributor_count = 0
        self.indie_release_count = 0
        self.indie_readme = 0

        self.team_stargazers_count = 0
        self.team_forks_count = 0
        self.team_commits_count = 0
        self.team_code_edits = 0
        self.team_prs_count = 0
        self.team_open_issue_count = 0
        self.team_close_issue_count = 0
        self.team_watchers_count = 0
        self.team_dependencies = 0
        self.team_contributor_count = 0
        self.team_release_count = 0
        self.team_readme = 0

        self.owner_stargazers_count = 0
        self.owner_forks_count = 0
        self.owner_commits_count = 0
        self.owner_code_edits = 0
        self.owner_prs_count = 0
        self.owner_open_issue_count = 0
        self.owner_close_issue_count = 0
        self.owner_watchers_count = 0
        self.owner_dependencies = 0
        self.owner_contributor_count = 0
        self.owner_release_count = 0
        self.owner_readme = 0

        self.contributor_stargazers_count = 0
        self.contributor_forks_count = 0
        self.contributor_commits_count = 0
        self.contributor_code_edits = 0
        self.contributor_prs_count = 0
        self.contributor_open_issue_count = 0
        self.contributor_close_issue_count = 0
        self.contributor_watchers_count = 0
        self.contributor_dependencies = 0
        self.contributor_contributor_count = 0
        self.contributor_release_count = 0
        self.contributor_readme = 0

        self.excellent_contributor_score = 0
        self.owner_activity_score = 0
        self.contributor_activity_score = 0
        self.additional_score = 0
        try :
            print("total_commit: ",self.total_commits)
        except Exception as e:
            print(e)
    def link_indie_repo(self,stats):
        self.indie_repositories.append(Repository(stats))
        return self.indie_repositories
    def link_team_repo(self,stats):
        self.team_repositories.append(Repository(stats))
        return self.team_repositories
    def link_owner_repo(self,stats):
        self.owner_repositories.append(Repository(stats))
        return self.indie_repositories
    def link_contributor_repo(self,stats):
        self.contributor_repositories.append(Repository(stats))
        return self.team_repositories
    def showContribution(self):
        strFormat = "%-20s"
        print(strFormat %("star"),self.stars)
        print(strFormat %("followers"),self.followers)
        print(strFormat %("followings"),self.followings)
        print(strFormat %("total_repos"),self.total_repos)
        print(strFormat %("total_commits"),self.total_commits)
        print(strFormat %("total_PRs"),self.total_PRs)
        print(strFormat %("total_issues"),self.total_issues)
        print(strFormat %("achievements"),self.achievements)
        print(strFormat %("highlights"),self.highlights)
        print("## Indie repositories ##")
        for repo in self.indie_repositories :
            repo.showCompact()
        print("## Team repositories ##")
        for repo in self.team_repositories :
            repo.showCompact()
        print("## Owner repositories ##")
        for repo in self.owner_repositories :
            repo.showCompact()
        print("## Contributor repositories ##")
        for repo in self.contributor_repositories :
            repo.showCompact()
    def sumContribution(self):
        ##### Seperate 1: indie and team #####
        indie_stargazers_count = 0
        indie_forks_count = 0
        indie_commits_count = 0
        indie_code_edits = 0
        indie_prs_count = 0
        indie_open_issue_count = 0
        indie_close_issue_count = 0
        indie_watchers_count = 0
        indie_dependencies = 0
        indie_contributors_count = 0
        indie_release_count = 0
        indie_readme = 0
        for indie in self.indie_repositories:
            print("indie ",indie.commits_count)
            indie_stargazers_count += indie.stargazers_count
            indie_forks_count += indie.forks_count
            indie_commits_count += indie.commits_count
            indie_code_edits += indie.code_edits
            indie_prs_count += indie.prs_count
            indie_open_issue_count += indie.open_issue_count
            indie_close_issue_count += indie.close_issue_count
            indie_watchers_count += indie.watchers_count
            indie_dependencies += indie.dependencies
            indie_contributors_count += indie.contributors_count
            indie_release_count += indie.release_count
            indie_readme += indie.readme

        self.indie_stargazers_count = indie_stargazers_count
        self.indie_forks_count = indie_forks_count
        self.indie_commits_count = indie_commits_count
        self.indie_code_edits = indie_code_edits
        self.indie_prs_count = indie_prs_count
        self.indie_open_issue_count = indie_open_issue_count
        self.indie_close_issue_count = indie_close_issue_count
        self.indie_watchers_count = indie_watchers_count
        self.indie_dependencies = indie_dependencies
        self.indie_contributors_count = indie_contributors_count
        self.indie_release_count = indie_release_count
        self.indie_readme = indie_readme

        team_stargazers_count = 0
        team_forks_count = 0
        team_commits_count = 0
        team_code_edits = 0
        team_prs_count = 0
        team_open_issue_count = 0
        team_close_issue_count = 0
        team_watchers_count = 0
        team_dependencies = 0
        team_contributors_count = 0
        team_release_count = 0
        team_readme = 0
        for team in self.team_repositories:
            print("team ",team.commits_count)
            team_stargazers_count += team.stargazers_count
            team_forks_count += team.forks_count
            team_commits_count += team.commits_count
            team_code_edits += team.code_edits
            team_prs_count += team.prs_count
            team_open_issue_count += team.open_issue_count
            team_close_issue_count += team.close_issue_count
            team_watchers_count += team.watchers_count
            team_dependencies += team.dependencies
            team_contributors_count += team.contributors_count
            team_release_count += team.release_count
            team_readme += team.readme
        self.team_stargazers_count = team_stargazers_count
        self.team_forks_count = team_forks_count
        self.team_commits_count = team_commits_count
        self.team_code_edits = team_code_edits
        self.team_prs_count = team_prs_count
        self.team_open_issue_count = team_open_issue_count
        self.team_close_issue_count = team_close_issue_count
        self.team_watchers_count = team_watchers_count
        self.team_dependencies = team_dependencies
        self.team_contributors_count = team_contributors_count
        self.team_release_count = team_release_count
        self.team_readme = team_readme
        ##### Seperate 2: owner and contributor #####
        owner_stargazers_count = 0
        owner_forks_count = 0
        owner_commits_count = 0
        owner_code_edits = 0
        owner_prs_count = 0
        owner_open_issue_count = 0
        owner_close_issue_count = 0
        owner_watchers_count = 0
        owner_dependencies = 0
        owner_contributors_count = 0
        owner_release_count = 0
        owner_readme = 0
        for owner in self.owner_repositories:
            print("owner ",owner.commits_count)
            owner_stargazers_count += owner.stargazers_count
            owner_forks_count += owner.forks_count
            owner_commits_count += owner.commits_count
            owner_code_edits += owner.code_edits
            owner_prs_count += owner.prs_count
            owner_open_issue_count += owner.open_issue_count
            owner_close_issue_count += owner.close_issue_count
            owner_watchers_count += owner.watchers_count
            owner_dependencies += owner.dependencies
            owner_contributors_count += owner.contributors_count
            owner_release_count += owner.release_count
            owner_readme += owner.readme

        self.owner_stargazers_count = owner_stargazers_count
        self.owner_forks_count = owner_forks_count
        self.owner_commits_count = owner_commits_count
        self.owner_code_edits = owner_code_edits
        self.owner_prs_count = owner_prs_count
        self.owner_open_issue_count = owner_open_issue_count
        self.owner_close_issue_count = owner_close_issue_count
        self.owner_watchers_count = owner_watchers_count
        self.owner_dependencies = owner_dependencies
        self.owner_contributors_count = owner_contributors_count
        self.owner_release_count = owner_release_count
        self.owner_readme = owner_readme

        contributor_stargazers_count = 0
        contributor_forks_count = 0
        contributor_commits_count = 0
        contributor_code_edits = 0
        contributor_prs_count = 0
        contributor_open_issue_count = 0
        contributor_close_issue_count = 0
        contributor_watchers_count = 0
        contributor_dependencies = 0
        contributor_contributors_count = 0
        contributor_release_count = 0
        contributor_readme = 0
        print("contributor len ", len(self.contributor_repositories))
        for contributor in self.contributor_repositories:
            print("contributor ",contributor.commits_count)
            contributor_stargazers_count += contributor.stargazers_count
            contributor_forks_count += contributor.forks_count
            contributor_commits_count += contributor.commits_count
            contributor_code_edits += contributor.code_edits
            contributor_prs_count += contributor.prs_count
            contributor_open_issue_count += contributor.open_issue_count
            contributor_close_issue_count += contributor.close_issue_count
            contributor_watchers_count += contributor.watchers_count
            contributor_dependencies += contributor.dependencies
            contributor_contributors_count += contributor.contributors_count
            contributor_release_count += contributor.release_count
            contributor_readme += contributor.readme

        self.contributor_stargazers_count = contributor_stargazers_count
        self.contributor_forks_count = contributor_forks_count
        self.contributor_commits_count = contributor_commits_count
        self.contributor_code_edits = contributor_code_edits
        self.contributor_prs_count = contributor_prs_count
        self.contributor_open_issue_count = contributor_open_issue_count
        self.contributor_close_issue_count = contributor_close_issue_count
        self.contributor_watchers_count = contributor_watchers_count
        self.contributor_dependencies = contributor_dependencies
        self.contributor_contributors_count = contributor_contributors_count
        self.contributor_release_count = contributor_release_count
        self.contributor_readme = contributor_readme

    def getTotalContribution(self):
        result = dict()
        result["stars"] = self.stars
        result["followers"] = self.followers
        result["followings"] = self.followings
        result["total_repos"] = self.total_repos
        result["total_commits"] = self.total_commits
        result["total_PRs"] = self.total_PRs
        result["total_issues"] = self.total_issues
        result["achievements"] = self.achievements
        result["highlights"] = self.highlights

        result["indie_stargazers_count"] = self.indie_stargazers_count
        result["indie_forks_count"] = self.indie_forks_count
        result["indie_commits_count"] = self.indie_commits_count
        result["indie_code_edits"] = self.indie_code_edits
        result["indie_prs_count"] = self.indie_prs_count
        result["indie_open_issue_count"] = self.indie_open_issue_count
        result["indie_close_issue_count"] = self.indie_close_issue_count
        result["indie_watchers_count"] = self.indie_watchers_count
        result["indie_dependencies"] = self.indie_dependencies
        result["indie_contributor_count"] = self.indie_contributor_count
        result["indie_release_count"] = self.indie_release_count
        result["indie_readme"] = self.indie_readme

        result["team_stargazers_count"] = self.team_stargazers_count
        result["team_forks_count"] = self.team_forks_count
        result["team_commits_count"] = self.team_commits_count
        result["team_code_edits"] = self.team_code_edits
        result["team_prs_count"] = self.team_prs_count
        result["team_open_issue_count"] = self.team_open_issue_count
        result["team_close_issue_count"] = self.team_close_issue_count
        result["team_watchers_count"] = self.team_watchers_count
        result["team_dependencies"] = self.team_dependencies
        result["team_contributor_count"] = self.team_contributor_count
        result["team_release_count"] = self.team_release_count
        result["team_readme"] = self.team_readme

        result["owner_stargazers_count"] = self.owner_stargazers_count
        result["owner_forks_count"] = self.owner_forks_count
        result["owner_commits_count"] = self.owner_commits_count
        result["owner_code_edits"] = self.owner_code_edits
        result["owner_prs_count"] = self.owner_prs_count
        result["owner_open_issue_count"] = self.owner_open_issue_count
        result["owner_close_issue_count"] = self.owner_close_issue_count
        result["owner_watchers_count"] = self.owner_watchers_count
        result["owner_dependencies"] = self.owner_dependencies
        result["owner_contributor_count"] = self.owner_contributor_count
        result["owner_release_count"] = self.owner_release_count
        result["owner_readme"] = self.owner_readme

        result["contributor_stargazers_count"] = self.contributor_stargazers_count
        result["contributor_forks_count"] = self.contributor_forks_count
        result["contributor_commits_count"] = self.contributor_commits_count
        result["contributor_code_edits"] = self.contributor_code_edits
        result["contributor_prs_count"] = self.contributor_prs_count
        result["contributor_open_issue_count"] = self.contributor_open_issue_count
        result["contributor_close_issue_count"] = self.contributor_close_issue_count
        result["contributor_watchers_count"] = self.contributor_watchers_count
        result["contributor_dependencies"] = self.contributor_dependencies
        result["contributor_contributor_count"] = self.contributor_contributor_count
        result["contributor_release_count"] = self.contributor_release_count
        result["contributor_readme"] = self.contributor_readme

        result["total_stargazers_count"] = self.indie_stargazers_count+self.team_stargazers_count
        result["total_forks_count"] = self.indie_forks_count+self.team_forks_count
        result["total_commits_count"] = self.indie_commits_count+self.team_commits_count
        result["total_code_edits"] = self.indie_code_edits+self.team_code_edits
        result["total_prs_count"] = self.indie_prs_count+self.team_prs_count
        result["total_open_issue_count"] = self.indie_open_issue_count+self.team_open_issue_count
        result["total_close_issue_count"] = self.indie_close_issue_count+self.team_close_issue_count
        result["total_watchers_count"] = self.indie_watchers_count+self.team_watchers_count
        result["total_dependencies"] = self.indie_dependencies+self.team_dependencies
        result["total_contributor_count"] = self.indie_contributor_count+self.team_contributor_count
        result["total_release_count"] = self.indie_release_count+self.team_release_count
        result["total_readme"] = self.indie_readme+self.team_readme
        
        return result 
    
    def yieldScore(self):
        # Reset
        self.excellent_contributor_score = 0
        self.owner_activity_score = 0
        self.contributor_activity_score = 0
        self.additional_score = 0
        print("cal star")
        if self.stars >= 50 :
            #우수 오픈소스 기여자 62? 50?
            self.excellent_contributor_score = 5
        elif self.stars < 3 :
            self.additional_score += 0
        elif self.stars < 10 :
            self.additional_score += 0.2
        elif self.stars < 20 :
            self.additional_score += 0.4
        elif self.stars < 30 :
            self.additional_score += 0.6
        elif self.stars < 40 :
            self.additional_score += 0.8
        elif self.stars < 50 :
            self.additional_score += 1.0

        print("cal contribution")
        contribution = self.owner_commits_count + self.owner_prs_count + self.contributor_commits_count + self.contributor_prs_count + self.total_issues
        
        if contribution < 10 :
            #우수 오픈소스 기여자 62? 50?
            self.additional_score += 0
        elif contribution <50 :
            self.additional_score += 0.2
        elif contribution < 100 :
            self.additional_score += 0.4
        elif contribution < 200 :
            self.additional_score += 0.6
        elif contribution < 500 :
            self.additional_score += 0.8
        elif contribution >= 500 :
            self.additional_score += 1.0

        print("cal contributor activity")
        if self.contributor_open_issue_count >= 1 :
            self.contributor_activity_score += 1.5
        elif self.contributor_prs_count >= 1 :
            self.contributor_activity_score += 1.5

        print("cal owner activity")
        repo_score = 0
        for repo in self.owner_repositories :
            ret = repo.calculateRepoScore()
            if repo_score < ret :
                repo_score = ret
                print(repo.repo_name, " has ", repo.repo_score)
class Repository:
    # watcher typo wacher
    def __init__(self, stats):
        try:
            self.repo_name = stats["repo_name"]
            self.stargazers_count = stats["stargazers_count"]
            self.forks_count = stats["forks_count"]
            self.commits_count = stats["commits_count"]
            self.code_edits = stats["code_edits"]
            self.prs_count = stats["prs_count"]
            self.open_issue_count = stats["open_issue_count"]
            self.close_issue_count = stats["close_issue_count"]
            self.watchers_count = stats["wachers_count"]
            self.dependencies = stats["dependencies"]
            self.language = stats["language"]
            self.create_date = stats["create_date"]
            self.update_date = stats["update_date"]
            self.contributors_count = stats["contributors_count"]
            self.release_ver = stats["release_ver"]
            self.release_count = stats["release_count"]
            self.license = stats["license"]
            self.readme = stats["readme"]
            self.proj_short_desc = stats["proj_short_desc"]

            self.repo_score = 0
        except Exception as e:
            print("repo ",e)
    def showCompact(self):
        try: 
            strFormat = "%-20s"
            print(strFormat %("repo_name"),self.repo_name)
            print(strFormat %("commits_count"),self.commits_count)
            print("")
        except Exception as e:
            print("show repo: ",e)
    def show(self):
        try:
            strFormat = "%-20s"
            print(strFormat %("repo_name"),self.repo_name)
            print(strFormat %("create_date"),self.create_date)
            print(strFormat %("update_date"),self.update_date)
            print(strFormat %("stargazers_count"),self.stargazers_count)
            print(strFormat %("commits_count"),self.commits_count)
            print(strFormat %("forks_count"),self.forks_count)
            print(strFormat %("open_issue_count"),self.open_issue_count)
            print(strFormat %("close_issue_count"),self.close_issue_count)
            print(strFormat %("watchers_count"),self.watchers_count)
            print(strFormat %("language"),self.language)
            print(strFormat %("contributors_count"),self.contributors_count)
            print("")
        except Exception as e:
            print("show repo: ",e)

    def showDetail(self):
        strFormat = "%-20s"
        print(strFormat %("repo_name"),self.repo_name)
        print(strFormat %("stargazers_count"),self.stargazers_count)
        print(strFormat %("forks_count"),self.forks_count)
        print(strFormat %("commits_count"),self.commits_count)
        print(strFormat %("code_edits"),self.code_edits)
        print(strFormat %("prs_count"),self.prs_count)
        print(strFormat %("open_issue_count"),self.open_issue_count)
        print(strFormat %("close_issue_count"),self.close_issue_count)
        print(strFormat %("watchers_count"),self.watchers_count)
        print(strFormat %("dependencies"),self.dependencies)
        print(strFormat %("language"),self.language)
        print(strFormat %("create_date"),self.create_date)
        print(strFormat %("update_date"),self.update_date)
        print(strFormat %("contributors_count"),self.contributors_count)
        print(strFormat %("release_ver"),self.release_ver)
        print(strFormat %("release_count"),self.release_count)
        print(strFormat %("license"),self.license)
        print(strFormat %("readme"),self.readme)
        print(strFormat %("proj_short_desc"),self.proj_short_desc)
        print("")

    def calculateRepoScore(self):
        print("cal repo score")
        if self.commits_count >= 2 :
            self.repo_score += 0.5
        else :
            return 0
        if self.license is not None and self.readme is not None and self.proj_short_desc is not None:
            self.repo_score += 0.5
        if self.dependencies != 0 :
            self.repo_score += 0.5
        return self.repo_score

def saveJson(tableName:str):
    cursor = githubDB.cursor(pymysql.cursors.DictCursor)

    sql = f"SELECT * from {tableName};"
    cursor.execute(query=sql)
    result = cursor.fetchall()

    # datetime type occur serialize exception
    statsList = result
    for stats in statsList:
        for data in stats:
            if isinstance(stats[data], datetime.date):
                stats[data] = stats[data].strftime('%Y-%m-%d')

    with open(f"./{tableName}.json", 'w', encoding="utf-8") as jsonfile:
        try:
            jsonfile.write(json.dumps(result, ensure_ascii=False))
        except Exception as e:
            print(e)
def saveTotalJson(contributorDict):
    print("saveTotalJson fucntion")
    ## 1. sum repo statistic
    print("sum repo statistic")
    for contributor in contributorDict:
        print(contributor, " sum start...")
        contributorDict[contributor].sumContribution()
    ## 2. save total statistic
    result = dict()
    print("save total statistic")
    for contributor in contributorDict:
        result[contributor] = contributorDict[contributor].getTotalContribution()

    with open(f"./github_statistic.json", 'w', encoding="utf-8") as jsonfile:
        try:
            jsonfile.write(json.dumps(result, ensure_ascii=False))
        except Exception as e:
            print(e)
    print("done!!")
        
def makeContributor():
    print("make contributor")
    with open("github_overview.json",'r', encoding="utf-8") as overview:
        overview_data = json.load(overview)
    contributorDict = dict()
    for contributor in overview_data:
        contributorDict[contributor['github_id']] = Contributor(contributor)
    return contributorDict

def linkRepo(contributorDict:dict):
    print("link Repo")
    with open("github_repo_stats.json",'r', encoding="utf-8") as repo:
        repo_stats_data = json.load(repo)

    with open("github_repo_contributor.json",'r', encoding="utf-8") as repo:
        repo_contributor_data = json.load(repo)
    exceptList = []
    for repo_stats in repo_stats_data:
        try:
            if(repo_stats["contributors_count"] == 1):
                contributorDict[repo_stats["github_id"]].link_indie_repo(repo_stats)
            else :
                team = 0
                print("find other contributor")
                for repo_contributor in repo_contributor_data:
                    if repo_contributor["repo_name"] == repo_stats["repo_name"] :
                        print("find!! contributor")
                        contributorDict[repo_contributor["github_id"]].link_team_repo(repo_stats)
                    team +=1 
                print(str(team) + " compare more")

            # seperate 2: owner and contributor
            print("######## seperate 2: owner and contributor #########")
            if(repo_stats["contributors_count"] == 1):
                print("1 contributor link owner_repo")
                contributorDict[repo_stats["github_id"]].link_owner_repo(repo_stats)
            else :
                com = 0
                print("2. find other contributor")
                for repo_contributor in repo_contributor_data:
                    if repo_contributor["repo_name"] == repo_stats["repo_name"] :
                        print("repo: ", repo_contributor["repo_name"])
                        if (repo_stats["github_id"] == repo_contributor["github_id"]) and (repo_contributor["github_id"] == repo_contributor["owner_id"]) :
                            contributorDict[repo_contributor["github_id"]].link_owner_repo(repo_stats)
                            print("2-1. link owner repo owner's name equal ", repo_contributor["owner_id"])
                        elif repo_stats["github_id"] == repo_contributor["github_id"] :
                            contributorDict[repo_contributor["github_id"]].link_contributor_repo(repo_stats)
                            print("2-2. link contributor_repo ", repo_contributor["github_id"])
                            com +=1 
                print(str(com) + " compare more")

        except Exception as e:
            print(f"{repo_stats['repo_name']} has error", e)
            exceptList.append(repo_stats)
            continue
    with open("github_repo_except.json",'w', encoding="utf-8") as expt:
        expt.write(json.dumps(exceptList, ensure_ascii=False))
    return contributorDict

def yieldScore(contributorDict:dict):
    print("yieldScore", type(contributorDict))
    
    with open("github_overview.json",'r', encoding="utf-8") as overview:
        overview_data = json.load(overview)
    scoreList = []
    print("yieldScore", type(contributorDict))
    
    for overview in overview_data:
        print("for ", overview["github_id"])
        try :
            resultDict = dict()
            print(contributorDict[overview["github_id"]].stars)
            contributorDict[overview["github_id"]].yieldScore()
            
            resultDict["github_id"] = overview["github_id"]
            print(overview["github_id"])
            resultDict["excellent_contributor_score"] = contributorDict[overview["github_id"]].excellent_contributor_score
            print(resultDict["excellent_contributor_score"])
            resultDict["owner_activity_score"] = contributorDict[overview["github_id"]].owner_activity_score
            resultDict["contributor_activity_score"] = contributorDict[overview["github_id"]].contributor_activity_score
            resultDict["additional_score"] = contributorDict[overview["github_id"]].additional_score
            resultDict["total_score"] = resultDict["excellent_contributor_score"] + resultDict["owner_activity_score"] + resultDict["contributor_activity_score"] + resultDict["additional_score"]
            scoreList.append(resultDict)
        except Exception as e:
            print(e)
            pass
    with open("github_score.json",'w', encoding="utf-8") as score:
        score.write(json.dumps(scoreList, ensure_ascii=False))
    return contributorDict