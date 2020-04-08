import { decorate, observable, action, computed } from 'mobx'

class Store {
    showSearch = false

    changeShowSearch = () => this.showSearch = !this.showSearch
}

decorate(Store, {
    showSearch: observable,
    changeShowSearch: action
})

export default new Store()