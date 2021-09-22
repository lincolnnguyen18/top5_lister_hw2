export default class DBManager {
    // QUERY AND MUTATION FUNCTIONS GET/SET DATA FROM/TO
    // AN EXTERNAL SOURCE, WHICH FOR THIS APPLICATION
    // MEANS THE BROWSER'S LOCAL STORAGE
    queryGetSessionData = () => {
        let sessionDataString = localStorage.getItem("top5-data");
        return JSON.parse(sessionDataString);
    }

    queryIsList = (key) => {
        let list = localStorage.getItem("top5-list-" + key);
        return list != null;
    }

    /**
     * This query asks local storage for a list with a particular key,
     * which is then returned by this function.
     */
    queryGetList = (key) => {
        let listString = localStorage.getItem("top5-list-" + key);
        return JSON.parse(listString);
    }

    updateItem = (key, itemIndex, newName) => {
        let newList = this.queryGetList(key);
        newList.items[itemIndex] = newName;
        localStorage.setItem("top5-list-" + key, JSON.stringify(newList));
    }

    mutationCreateList = (list) => {
        this.mutationUpdateList(list);
    }

    mutationDeleteList = (key) => {
        console.log(`Deleting list with key = ${key}`);
        localStorage.removeItem("top5-list-" + key);
        console.log("before: ", this.queryGetSessionData());
        let newSessionData = this.queryGetSessionData();
        newSessionData.keyNamePairs = newSessionData.keyNamePairs.filter(list => list.key != key);
        newSessionData.nextKey -= 1;
        newSessionData.counter -= 1;
        // Reassign keys
        newSessionData.keyNamePairs.forEach((list, index) => {
            // Update key of list itself in local storage
            let newList = this.queryGetList(list.key);
            newList.key = index;
            this.mutationUpdateList(newList);
            // Update key of list in session data
            list.key = index;
        });
        // Remove last list
        localStorage.removeItem("top5-list-" + newSessionData.nextKey);
        this.mutationUpdateSessionData(newSessionData);
        console.log("after: ", this.queryGetSessionData());
    }

    mutationUpdateList = (list) => {
        // AND FLOW THOSE CHANGES TO LOCAL STORAGE
        let listString = JSON.stringify(list);
        localStorage.setItem("top5-list-" + list.key, listString);
        // // Also update session data
        let newSessionData = this.queryGetSessionData();
        // Append new object to keyNamePairs
        newSessionData.keyNamePairs.push(list);
        // Update nextKey
        newSessionData.nextKey += 1;
        // Update counter
        newSessionData.counter += 1;
        // Update session data
        this.mutationUpdateSessionData(newSessionData);
    }
    
    mutationUpdateSessionData = (sessionData) => {
        let sessionDataString = JSON.stringify(sessionData);
        localStorage.setItem("top5-data", sessionDataString);
    }
}