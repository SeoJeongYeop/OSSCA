import contribution_evaluator as cv

if __name__ == "__main__":
    contributorDict = {}
    while(1):
        print("1: Fetch all table and save json file")
        print("2: Fetch input table and save json file")
        print("3: Json make contributor object")
        print("4: Contributor link repository data")
        print("5: Merge Json data and save json file")
        print("6: evaluate opensource score")
        print("8: Show contributor data")
        print("9: quit")
        num = input(">>>")
        if(num=='1'):
            try :
                tableNameList = ["github_overview","github_repo_commits","github_repo_contributor","github_repo_stats", "github_repo_stats_yymm","github_stats_yymm","student_tab"]
                for tableName in tableNameList :
                    cv.saveJson(tableName)
            except Exception as e:
                print("error1: ",e)
        if(num=='2'):
            try :
                print("Input table name:")
                tableName = input(">>>")
                cv.saveJson(tableName)
            except Exception as e:
                print("error2: ",e)
        elif(num=='3'):
            try:
                contributorDict = cv.makeContributor()
            except Exception as e:
                print("error3: ",e)
        elif(num=='4'):
            try:
                contributorDict = cv.linkRepo(contributorDict)
            except Exception as e:
                print("error4: ",e)
        elif(num=='5'):
            try:
                cv.saveTotalJson(contributorDict)
            except Exception as e:
                print("error5: ",e)
        elif(num=='6'):
            try:
                cv.yieldScore(contributorDict)
            except Exception as e:
                print("error6: ",e)
        elif(num=='8'):
            try:
                print("input contributor name")
                name = input(">>>")
                print("How should it print out? 1. Compact 2. Normal 3. Detail")
                how = input(">>>")
                contributorDict[name].showContribution(how)
            except Exception as e:
                print("error8: ",e)
        elif(num=='9'):
            print("Bye!")
            break
        else:
            continue