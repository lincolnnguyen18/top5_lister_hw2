import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS';
import ChangeItem_Transaction from './transactions/ChangeItem_Transaction';
import MoveItem_Transaction from './transactions/MoveItem_Transaction';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        this.tps = new jsTPS();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData,
            listToDelete : null,
            canUndo: false,
            canRedo: false,
            canClose: false,
            dragIndex: null,
        }

        // Listen for ctrl z and ctrl y
        document.addEventListener('keydown', (event) => {
            if (event.keyCode === 90 && event.ctrlKey) {
                this.tps.undoTransaction();
                this.setState({ canUndo: this.tps.hasTransactionToUndo(), canRedo: this.tps.hasTransactionToRedo() });
            } else if (event.keyCode === 89 && event.ctrlKey) {
                this.tps.doTransaction();
                this.setState({ canUndo: this.tps.hasTransactionToUndo(), canRedo: this.tps.hasTransactionToRedo() });
            }
        });
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        this.setState({
            canUndo: false,
            canRedo: false,
            canClose: true,
        });
        this.tps.clearAllTransactions();

        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
        });
    }
    addMoveItemTransaction = (oldIndex, newIndex) => {
        if (oldIndex == newIndex) {
            return;
        }
        let transaction = new MoveItem_Transaction(this, oldIndex, newIndex);
        this.tps.addTransaction(transaction);
        this.setState({ canUndo: this.tps.hasTransactionToUndo(), canRedo: this.tps.hasTransactionToRedo() });
    }
    moveItem = (oldIndex, newIndex) => {
        // move item from oldIndex to newIndex while keeping the order of the other items
        let newItems = this.state.currentList.items;
        let itemToMove = newItems[oldIndex];
        newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, itemToMove);
        this.setState({
            currentList: {
                ...this.state.currentList,
                items: newItems
            }
        });
    }
    actuallyRename = (newName, index) => {
        let oldName = this.state.currentList.items[index];
        console.log(`Rename item ${oldName} at index ${index} to ${newName}`)
        let currentList = this.state.currentList;
        currentList.items[index] = newName;
        this.setState({ currentList });
        // this.db.mutationUpdateList(currentList);
        this.db.updateItem(currentList.key, index, newName);
    }
    renameItem = (newName, index) => {
        console.log(this.state.currentList);
        let oldName = this.state.currentList.items[index];
        if (oldName === newName) {
            return;
        }
        this.tps.addTransaction(new ChangeItem_Transaction(this, index, oldName, newName));
        this.setState({ canUndo: this.tps.hasTransactionToUndo(), canRedo: this.tps.hasTransactionToRedo() });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList && currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        // console.log(`Loading list with key ${key} and current list key is ${this.state.currentList ? this.state.currentList.key : null}`)
        if (this.state.currentList && this.state.currentList.key == key) {
            // console.log("SAME!")
            return;
        }
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData,
            canUndo: false,
            canRedo: false
        }), () => {
            // ANY AFTER EFFECTS?
            this.tps.clearAllTransactions();
            this.setState({ canClose: true });
            // console.log("Loading list!");
            // console.log(this.state.currentList.items);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            this.setState({ canUndo: false, canRedo: false, canClose: false });
        });
    }

    deleteList = () => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        // console.log(`DELETE list ${this.state.listToDelete.name}`)
        if (this.state.listToDelete.key == this.state.currentList.key) {
            this.setState({ canUndo: false, canRedo: false, canClose: false });
        }
        this.db.mutationDeleteList(this.state.listToDelete.key);
        this.setState(prevState => ({
            sessionData: this.db.queryGetSessionData(),
        }), () => {
            // THE TRANSACTION STACK IS CLEARED
            this.hideDeleteListModal();
        });
    }


    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal = (keyNamePair) => {
        console.log(`listToDelete = ${keyNamePair.name}`)
        this.setState(prevState => ({
            listToDelete: keyNamePair,
        }), () => {
            // ANY AFTER EFFECTS?
        });
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    render() {
        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    closeEnabled={this.state.canClose}
                    undoEnabled={this.state.canUndo}
                    redoEnabled={this.state.canRedo}
                    closeCallback={() => {
                        this.closeCurrentList();
                    }}
                    undoCallback={() => {
                        this.tps.undoTransaction();
                        this.setState({ canUndo: this.tps.hasTransactionToUndo(), canRedo: this.tps.hasTransactionToRedo() });
                    }}
                    doCallback={() => {
                        this.tps.doTransaction();
                        this.setState({ canUndo: this.tps.hasTransactionToUndo(), canRedo: this.tps.hasTransactionToRedo() });
                    }}
                />
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    showModalCallback={this.showDeleteListModal}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <Workspace
                    currentList={this.state.currentList}
                    renameItemCallback={this.renameItem}
                    moveItemCallback={this.addMoveItemTransaction}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    listToDelete={this.state.listToDelete}
                    deleteListCallback={this.deleteList}
                />
            </div>
        );
    }
}

export default App;
