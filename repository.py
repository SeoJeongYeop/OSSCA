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