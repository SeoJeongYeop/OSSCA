class Repository:
    def __init__(self, stats):
        try:
            self.repo_name = stats["repo_name"]
            self.stargazers_count = stats["stargazers_count"]
            self.forks_count = stats["forks_count"]
            self.commits_count = stats["commits_count"]
            self.prs_count = stats["prs_count"]
            if stats["open_issue_count"] is not None:
                self.open_issue_count = stats["open_issue_count"]
            else :
                self.open_issue_count = 0
            if stats["close_issue_count"] is not None:
                self.close_issue_count = stats["close_issue_count"]
            else :
                self.close_issue_count = 0
            self.watchers_count = stats["watchers_count"]
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
            self.code_edits = 0
            self.additions = 0
            self.deletions = 0
            self.contributor_commits_count = 0
            # code_edits
            self.repo_score = 0
            self.repo_score_v2 = 0
        except Exception as e:
            print("repo ",e)
            
    def addEdits(self, addition, deletion):
        try:
            self.additions += addition
            self.deletions += deletion
            self.code_edits += addition
            self.code_edits += deletion
            self.contributor_commits_count += 1
        except Exception as e:
            print("addEdits: ",e)
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
        print(strFormat %("additions"),self.additions)
        print(strFormat %("deletions"),self.deletions)
        print(strFormat %("contributor_commits"),self.contributor_commits_count)
        print("")

    def calculateRepoScore(self):
        repo_data = dict()
        repo_data["best_repo"] = self.repo_name
        repo_data["code_score"] = 0
        repo_data["guideline_score"] = 0
        repo_data["other_project_score"] = 0
        repo_data["repo_score"] = 0
        if self.commits_count >= 2 and self.code_edits >= 500:
            self.repo_score += 0.5
            repo_data["code_score"] = 0.5
        else :
            # ??? ?????? ?????? ????????? ?????? ??????
            return repo_data
        if self.license is not None and self.readme != 0 and self.proj_short_desc is not None:
            self.repo_score += 0.5
            repo_data["guideline_score"] = 0.5
        if self.dependencies != 0 :
            self.repo_score += 0.5
            repo_data["other_project_score"] = 0.5
        repo_data["repo_score"] = repo_data["code_score"] + repo_data["guideline_score"] + repo_data["other_project_score"]
        return repo_data
    
    def calculateRepoScore_v2(self, max_code_edits = 10000, max_commit_count = 50, max_pr_issue = 7):
        #print("calculateRepoScore_v2")
        repo_data = dict()
        repo_data["best_repo"] = self.repo_name
        repo_data["score_10000L"] = min([self.code_edits, max_code_edits])/max_code_edits
        repo_data["score_50C"] = min([self.commits_count,max_commit_count])/max_commit_count
        repo_data["score_pr_issue"] = min([self.prs_count+self.open_issue_count,max_pr_issue])*0.7/max_pr_issue
        repo_data["guideline_score"] = 0
        repo_data["star_count"] = self.stargazers_count
        repo_data["fork_count"] = self.forks_count
        if self.license is not None and self.readme != 0 and self.proj_short_desc is not None:
            repo_data["guideline_score"] = 0.3
        
        repo_data["repo_score"] = repo_data["score_10000L"]+repo_data["score_50C"]+repo_data["score_pr_issue"]+repo_data["guideline_score"]
        self.repo_score_v2 = min([3,repo_data["repo_score"]])
        #print("self.repo_score_v2",self.repo_score_v2)
        return repo_data