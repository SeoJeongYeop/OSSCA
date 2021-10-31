import pymysql
import json
import datetime

import GITHUBDB
from contributor import Contributor

githubDB = pymysql.connect(
    user=GITHUBDB.SQL_USER,
    password=GITHUBDB.SQL_PW,
    host = GITHUBDB.SQL_HOST,
    port=GITHUBDB.SQL_PORT,
    db=GITHUBDB.SQL_DB,
)

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

    with open(f"./data/{tableName}.json", 'w', encoding="utf-8") as jsonfile:
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

    with open(f"./data/github_statistic.json", 'w', encoding="utf-8") as jsonfile:
        try:
            jsonfile.write(json.dumps(result, ensure_ascii=False))
        except Exception as e:
            print(e)
    print("done!!")
def savePeriodData():
    with open("./data/github_stats_yymm.json", 'r', encoding="utf-8") as yymm:
        period_data = json.load(yymm)
    
    #github id가 정렬되어 같은 이름은 연속해서 나온다고 가정
    resultList = []
    idDict = dict()
    periodDict = dict()
    dataDict = dict()
    initialize_dataDict(dataDict)
    p1 = period_data[0]
    github_id = p1["github_id"]
    year = p1["start_yymm"][0:4]
    #print("[0] ",github_id, year)
    for period in period_data :
        try :
            if github_id != period['github_id'] :
                # save and initialize
                periodDict[year] = dataDict
                dataDict = dict()
                year = period["start_yymm"][0:4]
                initialize_dataDict(dataDict)
                # save and initialize
                idDict[github_id] = periodDict
                resultList.append(idDict)
                periodDict = dict()
                github_id = period['github_id']
            if year != period["start_yymm"][0:4] :
                # save and initialize
                periodDict[year] = dataDict
                dataDict = dict()
                year = period["start_yymm"][0:4]
                initialize_dataDict(dataDict)
            # print("star")
            # print(period["stars"])
            dataDict["stars"] += period["stars"]
            dataDict["num_of_cr_repos"] += period["num_of_cr_repos"]
            dataDict["num_of_co_repos"] += period["num_of_co_repos"]
            dataDict["num_of_commits"] += period["num_of_commits"]
            dataDict["num_of_PRs"] += period["num_of_PRs"]
            dataDict["num_of_issues"] += period["num_of_issues"]
        except Exception as e:
            print("period ",e)
    periodDict[year] = dataDict
    idDict[github_id] = periodDict
    resultList.append(idDict[github_id])

    with open(f"./data/github_yearly.json", 'w', encoding="utf-8") as jsonfile:
        try:
            jsonfile.write(json.dumps(resultList, ensure_ascii=False))
        except Exception as e:
            print(e)
    print("done!!")
def initialize_dataDict(dataDict:dict):
    dataDict["stars"] = 0
    dataDict["num_of_cr_repos"] = 0
    dataDict["num_of_co_repos"] = 0
    dataDict["num_of_commits"] = 0
    dataDict["num_of_PRs"] = 0
    dataDict["num_of_issues"] = 0
    return dataDict
def makeContributor():
    print("make contributor")
    with open("./data/github_overview.json",'r', encoding="utf-8") as overview:
        overview_data = json.load(overview)
    contributorDict = dict()
    for contributor in overview_data:
        contributorDict[contributor['github_id']] = Contributor(contributor)
    return contributorDict

def linkRepo(contributorDict:dict):
    print("link Repo")
    with open("./data/github_repo_stats.json",'r', encoding="utf-8") as repo:
        repo_stats_data = json.load(repo)

    with open("./data/github_repo_contributor.json",'r', encoding="utf-8") as repo:
        repo_contributor_data = json.load(repo)
    exceptList = []
    for repo_stats in repo_stats_data:
        try:
            print("######## seperate 1: indie and team #########")
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
                print("1. contributor link owner_repo")
                contributorDict[repo_stats["github_id"]].link_owner_repo(repo_stats)
            else :
                com = 0
                print("2. find other contributor")
                for repo_contributor in repo_contributor_data:
                    if repo_contributor["repo_name"] == repo_stats["repo_name"] :
                        print("repo: ", repo_contributor["repo_name"])
                        print("1. ", repo_stats["github_id"], " 2. ", repo_contributor["github_id"], " 3. ", repo_contributor["owner_id"])
                        if (repo_stats["github_id"] == repo_contributor["github_id"]) and (repo_contributor["github_id"] == repo_contributor["owner_id"]) :
                            contributorDict[repo_contributor["github_id"]].link_owner_repo(repo_stats)
                            print("2-1. link owner repo owner's name equal ", repo_contributor["owner_id"])
                            print(">> ", len(contributorDict[repo_contributor["github_id"]].owner_repositories))
                        else :
                        #repo_stats["github_id"] == repo_contributor["github_id"] :
                            contributorDict[repo_contributor["github_id"]].link_contributor_repo(repo_stats)
                            print("2-2. link contributor_repo ", repo_contributor["github_id"])
                            print(">> ", len(contributorDict[repo_contributor["github_id"]].contributor_repositories))
                            com +=1 
                print(str(com) + " compare more")

        except Exception as e:
            print(f"{repo_stats['repo_name']} has error", e)
            exceptList.append(repo_stats)
            continue
    with open("./data/github_repo_except.json",'w', encoding="utf-8") as expt:
        expt.write(json.dumps(exceptList, ensure_ascii=False))
    return contributorDict
def analyzeCommits(contributorDict:dict):
    # commit 데이터에서 기여자를 뽑아오면 exception이 너무 많이 생김
    # key값이 있는지 먼저 확인
    print("analyzeCommits", type(contributorDict))
    with open("./data/github_repo_commits.json",'r', encoding="utf-8") as commits:
        commits_data = json.load(commits)
    exception = []
    result=[]
    for commit in commits_data:
        try :
            if commit["github_id"] in contributorDict:
                for repository in contributorDict[commit["github_id"]].indie_repositories:
                    if repository.repo_name == commit["repo_name"]:
                        resultDict=dict()
                        print("[indie/id] commits: ",commit["github_id"], "commits: ",commit["author_github"]," commits repo: ",commit["repo_name"])
                        resultDict["type"] = "indie/id"
                        resultDict["commit_github_id"] = commit["github_id"]
                        resultDict["commit_author_github"] = commit["author_github"]
                        resultDict["commit_repo_name"] = commit["repo_name"]
                        resultDict["additions"] = commit["additions"]
                        resultDict["deletions"] = commit["deletions"]
                        result.append(resultDict)
                        repository.addEdits(commit["additions"], commit["deletions"])

                for repository in contributorDict[commit["github_id"]].team_repositories:
                    if repository.repo_name == commit["repo_name"]:
                        resultDict=dict()
                        print("[team/id] commits: ",commit["github_id"], "commits: ",commit["author_github"]," commits repo: ",commit["repo_name"])
                        resultDict["type"] = "team/id"
                        resultDict["commit_github_id"] = commit["github_id"]
                        resultDict["commit_author_github"] = commit["author_github"]
                        resultDict["commit_repo_name"] = commit["repo_name"]
                        resultDict["additions"] = commit["additions"]
                        resultDict["deletions"] = commit["deletions"]
                        result.append(resultDict)
                        repository.addEdits(commit["additions"], commit["deletions"])

                for repository in contributorDict[commit["github_id"]].owner_repositories:
                    if repository.repo_name == commit["repo_name"]:
                        resultDict=dict()
                        print("[owner/id] commits: ",commit["github_id"], "commits: ",commit["author_github"]," commits repo: ",commit["repo_name"])
                        resultDict["type"] = "owner/id"
                        resultDict["commit_github_id"] = commit["github_id"]
                        resultDict["commit_author_github"] = commit["author_github"]
                        resultDict["commit_repo_name"] = commit["repo_name"]
                        resultDict["additions"] = commit["additions"]
                        resultDict["deletions"] = commit["deletions"]
                        result.append(resultDict)
                        repository.addEdits(commit["additions"], commit["deletions"])

                for repository in contributorDict[commit["github_id"]].contributor_repositories:
                    if repository.repo_name == commit["repo_name"]:
                        resultDict=dict()
                        print("[contributor/id] commits: ",commit["github_id"], "commits: ",commit["author_github"]," commits repo: ",commit["repo_name"])
                        resultDict["type"] = "contributor/id"
                        resultDict["commit_github_id"] = commit["github_id"]
                        resultDict["commit_author_github"] = commit["author_github"]
                        resultDict["commit_repo_name"] = commit["repo_name"]
                        resultDict["additions"] = commit["additions"]
                        resultDict["deletions"] = commit["deletions"]
                        result.append(resultDict)

                        repository.addEdits(commit["additions"], commit["deletions"])
            elif commit["author_github"] in contributorDict:
                for repository in contributorDict[commit["author_github"]].indie_repositories:
                    if repository.repo_name == commit["repo_name"]:
                        resultDict=dict()
                        print("[indie/author] commits: ",commit["github_id"], "commits: ",commit["author_github"]," commits repo: ",commit["repo_name"])
                        resultDict["type"] = "indie/author"
                        resultDict["commit_github_id"] = commit["github_id"]
                        resultDict["commit_author_github"] = commit["author_github"]
                        resultDict["commit_repo_name"] = commit["repo_name"]
                        resultDict["additions"] = commit["additions"]
                        resultDict["deletions"] = commit["deletions"]
                        result.append(resultDict)
                        repository.addEdits(commit["additions"], commit["deletions"])

                for repository in contributorDict[commit["author_github"]].team_repositories:
                    if repository.repo_name == commit["repo_name"]:
                        resultDict=dict()
                        print("[team/author] commits: ",commit["github_id"], "commits: ",commit["author_github"]," commits repo: ",commit["repo_name"])
                        resultDict["type"] = "team/author"
                        resultDict["commit_github_id"] = commit["github_id"]
                        resultDict["commit_author_github"] = commit["author_github"]
                        resultDict["commit_repo_name"] = commit["repo_name"]
                        resultDict["additions"] = commit["additions"]
                        resultDict["deletions"] = commit["deletions"]
                        result.append(resultDict)
                        repository.addEdits(commit["additions"], commit["deletions"])

                for repository in contributorDict[commit["author_github"]].owner_repositories:
                    if repository.repo_name == commit["repo_name"]:
                        resultDict=dict()
                        print("[owner/author] commits: ",commit["github_id"], "commits: ",commit["author_github"]," commits repo: ",commit["repo_name"])
                        resultDict["type"] = "owner/author"
                        resultDict["commit_github_id"] = commit["github_id"]
                        resultDict["commit_author_github"] = commit["author_github"]
                        resultDict["commit_repo_name"] = commit["repo_name"]
                        resultDict["additions"] = commit["additions"]
                        resultDict["deletions"] = commit["deletions"]
                        result.append(resultDict)
                        repository.addEdits(commit["additions"], commit["deletions"])

                for repository in contributorDict[commit["author_github"]].contributor_repositories:
                    if repository.repo_name == commit["repo_name"]:
                        resultDict=dict()
                        print("[contributor/author] commits: ",commit["github_id"], "commits: ",commit["author_github"]," commits repo: ",commit["repo_name"])
                        resultDict["type"] = "contributor/author"
                        resultDict["commit_github_id"] = commit["github_id"]
                        resultDict["commit_author_github"] = commit["author_github"]
                        resultDict["commit_repo_name"] = commit["repo_name"]
                        resultDict["additions"] = commit["additions"]
                        resultDict["deletions"] = commit["deletions"]
                        result.append(resultDict)
                        repository.addEdits(commit["additions"], commit["deletions"])

        except Exception as e:
            exception.append(commit)
            print("error analyze commit: ", e)
        # owner and contributor skip now

    with open(f"./data/github_exception_commits.json", 'w', encoding="utf-8") as jsonfile:
        try:
            jsonfile.write(json.dumps(exception, ensure_ascii=False))
        except Exception as e:
            print(e)
    with open(f"./data/github_commits_log.json", 'w', encoding="utf-8") as jsonfile:
        try:
            jsonfile.write(json.dumps(result, ensure_ascii=False))
        except Exception as e:
            print(e)
    print("done!!")

        
def yieldScore(contributorDict:dict):
    print("yieldScore", type(contributorDict))
    
    with open("./data/github_overview.json",'r', encoding="utf-8") as overview:
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
    with open("./data/github_score.json",'w', encoding="utf-8") as score:
        score.write(json.dumps(scoreList, ensure_ascii=False))
    return contributorDict