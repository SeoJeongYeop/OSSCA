from typing import Dict
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
        self.total_PRs = stats["total_PRs"]
        self.total_issues = stats["total_issues"]
        self.achievements = stats["achievements"]
        self.highlights = stats["highlights"]
        self.repositories = []
        try :
            print("total_commit: ",self.total_commits)
        except Exception as e:
            print(e)
    def linkRepo(self,stats):
        self.repositories.append(Repository(stats))
        return self.repositories
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
        print("repositories")
        for repo in self.repositories :
            repo.show()
class Repository:
    # watcher typo wacher
    def __init__(self, stats):
        try:
            self.repo_name = stats["repo_name"]
            self.stargazers_count = stats["stargazers_count"]
            self.forks_count = stats["forks_count"]
            self.commits_count = stats["commits_count"]
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
            self.license = stats["license"]
            self.readme = stats["readme"]
            self.proj_short_desc = stats["proj_short_desc"]
        except Exception as e:
            print("repo ",e)
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
            print(strFormat %("watchers_count"),self.watchers_count)
            print("")
        except Exception as e:
            print("show repo: ",e)

    def showDetail(self):
        strFormat = "%-20s"
        print(strFormat %("repo_name"),self.repo_name)
        print(strFormat %("stargazers_count"),self.stargazers_count)
        print(strFormat %("forks_count"),self.forks_count)
        print(strFormat %("commits_count"),self.commits_count)
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
    exceptList = []
    for repo_stats in repo_stats_data:
        try:
            contributorDict[repo_stats["github_id"]].linkRepo(repo_stats)
        except:
            print(f"{repo_stats['github_id']} is maybe Team Repository")
            exceptList.append(repo_stats)
            continue
    with open("github_repo_except.json",'w', encoding="utf-8") as expt:
        expt.write(json.dumps(exceptList, ensure_ascii=False))
    return contributorDict

if __name__ == "__main__":
    contributorDict = {}
    while(1):
        print("1: Fetch all table and save json file")
        print("2: Fetch input table and save json file")
        print("5: Json make contributor object")
        print("6: Contributor link repository data")
        print("8: Show contributor data")
        print("9: quit")
        num = input(">>>")
        if(num=='1'):
            try :
                tableNameList = ["github_overview","github_repo_contributor","github_repo_stats", "github_repo_stats_yymm","github_stats_yymm","student_tab"]
                #tableName = input("Input table name:")
                for tableName in tableNameList :
                    saveJson(tableName)
            except Exception as e:
                print("error1: ",e)
        if(num=='2'):
            try :
                print("Input table name:")
                tableName = input(">>>")
                saveJson(tableName)
            except Exception as e:
                print("error2: ",e)
        elif(num=='5'):
            try:
                contributorDict = makeContributor()
            except Exception as e:
                print("error5: ",e)
        elif(num=='6'):
            try:
                contributorDict = linkRepo(contributorDict)
            except Exception as e:
                print("error6: ",e)
        elif(num=='8'):
            try:
                print("input contributor name")
                name = input(">>>")
                contributorDict[name].showContribution()
            except Exception as e:
                print("error8: ",e)
        elif(num=='9'):
            print("Bye!")
            break
        else:
            continue
