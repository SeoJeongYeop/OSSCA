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
                print("1 contributor link owner_repo")
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
                        elif repo_stats["github_id"] == repo_contributor["github_id"] :
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