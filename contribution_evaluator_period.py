import json
from contributor import Contributor
import pymysql
import GITHUBDB
import time

githubDB = pymysql.connect(
    user=GITHUBDB.SQL_USER,
    password=GITHUBDB.SQL_PW,
    host = GITHUBDB.SQL_HOST,
    port=GITHUBDB.SQL_PORT,
    db=GITHUBDB.SQL_DB,
)

def saveTotalJson(contributorDict:dict, year:str):
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

    with open(f"./year/github_statistic_{year}.json", 'w', encoding="utf-8") as jsonfile:
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

def linkRepo(contributorDict:dict, year:str):
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
                if repo_stats["create_date"][0:4] == year :
                    contributorDict[repo_stats["github_id"]].link_indie_repo(repo_stats)
            else :
                if repo_stats["create_date"][0:4] == year :
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
                if repo_stats["create_date"][0:4] == year :
                    print("1. contributor link owner_repo")
                    contributorDict[repo_stats["github_id"]].link_owner_repo(repo_stats)
            else :
                if repo_stats["create_date"][0:4] == year :
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
                                contributorDict[repo_contributor["github_id"]].link_contributor_repo(repo_stats)
                                print("2-2. link contributor_repo ", repo_contributor["github_id"])
                                print(">> ", len(contributorDict[repo_contributor["github_id"]].contributor_repositories))
                                com +=1 
                    print(str(com) + " compare more")

        except Exception as e:
            print(f"{repo_stats['repo_name']} has error", e)
            exceptList.append(repo_stats)
            continue
    with open(f"./year/github_repo_except_{year}.json",'w', encoding="utf-8") as expt:
        expt.write(json.dumps(exceptList, ensure_ascii=False))
    return contributorDict
def analyzeCommits(contributorDict:dict, year:str):
    # commit 데이터에서 기여자를 뽑아오면 exception이 너무 많이 생김
    # key값이 있는지 먼저 확인
    print("analyzeCommits", type(contributorDict))
    with open("./data/github_repo_commits.json",'r', encoding="utf-8") as commits:
        commits_data = json.load(commits)
    exception = []
    result=[]
    for commit in commits_data:
        if commit["github_id"] in contributorDict:
            try :
                for repository in contributorDict[commit["github_id"]].indie_repositories:
                    if commit["committer_date"][0:4] == year :
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
            except Exception as e:
                exception.append(commit)
                print("error github id indie repo: ", e)
            try:
                for repository in contributorDict[commit["github_id"]].team_repositories:
                    if commit["committer_date"][0:4] == year :
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
            except Exception as e:
                exception.append(commit)
                print("error github id team repo: ", e)
            try:
                for repository in contributorDict[commit["github_id"]].owner_repositories:
                    if commit["committer_date"][0:4] == year :
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
            except Exception as e:
                exception.append(commit)
                print("error github id owner repo: ", e)
            try:
                for repository in contributorDict[commit["github_id"]].contributor_repositories:
                    if commit["committer_date"][0:4] == year :
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
            except Exception as e:
                exception.append(commit)
                print("error github id contributor repo: ", e)

        elif commit["author_github"] in contributorDict:
            try:
                for repository in contributorDict[commit["author_github"]].indie_repositories:
                    if commit["committer_date"][0:4] == year :
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
            except Exception as e:
                exception.append(commit)
                print("error author indie repo: ", e)
            try:
                for repository in contributorDict[commit["author_github"]].team_repositories:
                    if commit["committer_date"][0:4] == year :
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
            except Exception as e:
                exception.append(commit)
                print("error author team repo: ", e)

            try:
                for repository in contributorDict[commit["author_github"]].owner_repositories:
                    if commit["committer_date"][0:4] == year :
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
            except Exception as e:
                exception.append(commit)
                print("error author owner repo: ", e)

            try:
                for repository in contributorDict[commit["author_github"]].contributor_repositories:
                    if commit["committer_date"][0:4] == year :
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
                print("error author contributor repo: ", e)


    with open(f"./year/github_exception_commits_{year}.json", 'w', encoding="utf-8") as jsonfile:
        try:
            jsonfile.write(json.dumps(exception, ensure_ascii=False))
        except Exception as e:
            print(e)
    with open(f"./year/github_commits_log_{year}.json", 'w', encoding="utf-8") as jsonfile:
        try:
            jsonfile.write(json.dumps(result, ensure_ascii=False))
        except Exception as e:
            print(e)
    print("done!!")
    
def analyzePrIssue(contributorDict:dict, year:str):
    print(year,": analyzePrIssue")
    with open("./data/github_pulls.json",'r', encoding="utf-8") as pulls:
        pulls_data = json.load(pulls)
    with open("./data/github_issues.json",'r', encoding="utf-8") as issues:
        issues_data = json.load(issues)
    for pr in pulls_data:
        if pr["owner_id"] != pr["github_id"] and year == pr["date"][0:4]:
            contributorDict[pr["github_id"]].countPr();
    for issue in issues_data :
        if issue["owner_id"] != issue["github_id"] and year == issue["date"][0:4]:
            contributorDict[issue["github_id"]].countIssue();
            
def yieldScore(contributorDict:dict, year:str, insert:bool):
    with open("./data/github_overview.json",'r', encoding="utf-8") as overview:
        overview_data = json.load(overview)
    scoreList = []
    
    for overview in overview_data:
        try :
            resultDict = dict()
            best_repo = contributorDict[overview["github_id"]].yieldScore()
            best_repo_v2 = contributorDict[overview["github_id"]].yieldScore_v2()
            resultDict["github_id"] = overview["github_id"]
            
            resultDict["excellent_contributor_score"] = contributorDict[overview["github_id"]].excellent_contributor_score
            resultDict["owner_activity_score"] = contributorDict[overview["github_id"]].owner_activity_score
            resultDict["contributor_activity_score"] = contributorDict[overview["github_id"]].contributor_activity_score
            resultDict["star_score"] = contributorDict[overview["github_id"]].star_score
            resultDict["contribution_score"] = contributorDict[overview["github_id"]].contribution_score
            resultDict["additional_score"] = contributorDict[overview["github_id"]].additional_score
            resultDict["total_score"] = resultDict["excellent_contributor_score"] + resultDict["owner_activity_score"] + resultDict["contributor_activity_score"] + resultDict["additional_score"]
            resultDict["total_star_count"] = contributorDict[overview["github_id"]].indie_stargazers_count + contributorDict[overview["github_id"]].team_stargazers_count
            resultDict["total_commit_count"] = contributorDict[overview["github_id"]].indie_commits_count+contributorDict[overview["github_id"]].team_commits_count
            scoreList.append(resultDict)
            resultDict["pr_count"] = contributorDict[overview["github_id"]].contribute_pr_count;
            resultDict["issue_count"] = contributorDict[overview["github_id"]].contribute_issue_count;
            print("#### insert into ####")
            try :
                print("#data: ",str(year+resultDict["github_id"]), str(resultDict["github_id"]), int(year), int(resultDict["excellent_contributor_score"]), str(best_repo["best_repo"]), float(best_repo["guideline_score"]), float(best_repo["code_score"]), float(best_repo["other_project_score"]), float(resultDict["contributor_activity_score"]), float(resultDict["star_score"]), float(resultDict["contribution_score"]), int(resultDict["total_star_count"]), int(resultDict["total_commit_count"]),int(resultDict["pr_count"]),int(resultDict["issue_count"]))
            except Exception as e :
                print("print data error ",e)
            if(insert) :
                try:
                    cursor = githubDB.cursor(pymysql.cursors.DictCursor)
                    insert_sql = '''INSERT INTO github_score(yid, github_id, year, excellent_contributor, best_repo, guideline_score, code_score, other_project_score, contributor_score, star_score, contribution_score, star_count, commit_count, pr_count, issue_count,fork_count, score_10000L, score_50C, score_pr_issue, guideline_score_v2, repo_score, score_star, score_fork, score_other_repo, additional_score) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'''
                    insert_arg = [str(year+resultDict["github_id"]), str(resultDict["github_id"]), int(year), int(resultDict["excellent_contributor_score"]), str(best_repo["best_repo"]), float(best_repo["guideline_score"]), float(best_repo["code_score"]), float(best_repo["other_project_score"]), float(resultDict["contributor_activity_score"]), float(resultDict["star_score"]), float(resultDict["contribution_score"]), int(resultDict["total_star_count"]), int(resultDict["total_commit_count"]),int(resultDict["pr_count"]),int(resultDict["issue_count"]),int(best_repo_v2["fork_count"]),
            round(float(best_repo_v2["score_10000L"]),3),
            round(float(best_repo_v2["score_50C"]),3),
            round(float(best_repo_v2["score_pr_issue"]),3),
            round(float(best_repo_v2["guideline_score"]),3),
            round(float(best_repo_v2["repo_score"]),3),
            round(float(best_repo_v2["score_star"]),3),
            round(float(best_repo_v2["score_fork"]),3),
            round(float(best_repo_v2["score_other_repo"]),3),
            round(float(best_repo_v2["additional_score"]),3)]
                    
                    print("#insert_sql ",insert_sql, "#insert_arg ", insert_arg)
                    cursor.execute(insert_sql, insert_arg)
                    githubDB.commit()
                    time.sleep(0.1)
                    print("done!!")

                except Exception as e:
                    print("insert error ", e)

        except Exception as e:
            print(e)
            pass
    with open(f"./year/github_score_{year}.json",'w', encoding="utf-8") as score:
        score.write(json.dumps(scoreList, ensure_ascii=False))
    return contributorDict