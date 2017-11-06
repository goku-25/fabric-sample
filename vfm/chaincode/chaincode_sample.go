package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type IndexItem struct {
	Programid string    `json:"programid"`
	Date      time.Time `json:"date"`
	Status    string    `json:"status"`
}

type Request struct {
	Involvedparties []string      `json:"involvedparties"`
	Transactionlist []Transaction `json:"transactionlist"`
}

type Transaction struct {
	TrnsactionDetails map[string]string `json:"transactiondetails"`
}

type SimpleChaincode struct {
}

func (t *SimpleChaincode) Init(APIstub shim.ChaincodeStubInterface) sc.Response {

	var index []IndexItem
	jsonAsBytes, err := json.Marshal(index)
	if err != nil {
		fmt.Println("Could not marshal index object", err)
		return shim.Error("error")
	}
	err = APIstub.PutState("index", jsonAsBytes)
	if err != nil {
		fmt.Println("Could not save updated index ", err)
		return shim.Error("error")
	}

	return shim.Success(nil)
}

func (t *SimpleChaincode) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
	function, args := APIstub.GetFunctionAndParameters()

	switch function {
	case "newRequest":
		return t.newRequest(APIstub, args)
	case "updateRequest":
		return t.updateRequest(APIstub, args)
	case "readIndex":
		return t.readIndex(APIstub, args)
	case "readRequest":
		return t.readRequest(APIstub, args)
	}
	return shim.Error("Invalid Smart Contract function name.")
}

//1.newrequest   (#user,#transactionlist)
func (t *SimpleChaincode) newRequest(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	// creating new request
	// {programid : 1234, involvedParties:['supplier', 'logistics', 'manufacturer','insurance']}
	fmt.Println("creating new newRequest")
	if len(args) < 4 {
		fmt.Println("Expecting three Argument")
		return shim.Error("Expected three arguments for new Request")
	}

	var request Request
	var indexItem IndexItem
	var transaction Transaction
	var index []IndexItem
	var date = time.Now()

	var programid = args[0]
	var status = args[1]
	var Involvedparties = args[2]
	var transactionString = args[3]

	fmt.Println(programid)
	fmt.Println(date)
	fmt.Println(status)

	//is array
	involvedpartiesArray := strings.Split(Involvedparties, ",")
	fmt.Printf("%v\n", involvedpartiesArray)
	fmt.Println(involvedpartiesArray)

	indexbytes, err := APIstub.GetState("index")
	if err != nil {
		return shim.Error("index not fetched")
	}

	//unmarshalling index obj
	err = json.Unmarshal(indexbytes, &index)
	if err != nil {
		fmt.Println("unable to unmarshal transaction data")
		return shim.Error("unable to unmarshal transaction data")
	}

	request.Involvedparties = involvedpartiesArray

	transactionmap := make(map[string]string)
	err = json.Unmarshal([]byte(transactionString), &transactionmap)
	if err != nil {
		fmt.Println("Could not marshal index object", err)
		return shim.Error("Could not marshal index object")
	}
	transaction.TrnsactionDetails = transactionmap

	request.Transactionlist = append(request.Transactionlist, transaction)

	//creating a indexitem obj
	indexItem.Programid = programid
	indexItem.Date = date
	indexItem.Status = status

	//adding index to index item
	index = append(index, indexItem)

	jsonAsBytes, err := json.Marshal(index)
	if err != nil {
		fmt.Println("Could not marshal index object", err)
		return shim.Error("Could not marshal index object")
	}
	err = APIstub.PutState("index", jsonAsBytes)
	if err != nil {
		fmt.Println("Could not save updated index ", err)
		return shim.Error("error")
	}

	//putting request object
	fmt.Println("requestObj",request)
	jsonAsBytes, err = json.Marshal(request)
	if err != nil {
		fmt.Println("Could not marshal request object", err)
		return shim.Error("error")
	}
	err = APIstub.PutState(programid, jsonAsBytes)
	if err != nil {
		fmt.Println("Could not save updated request ", err)
		return shim.Error("error")
	}

	fmt.Println("Successfully stored the request")
	return shim.Success(nil)

}

//2.updateRequest
func (t *SimpleChaincode) updateRequest(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	// creating new request
	// {programid : 1234, involvedParties:['supplier', 'logistics', 'manufacturer','insurance']}
	fmt.Println("creating new newRequest")
	if len(args) < 3 {
		fmt.Println("Expecting three Argument")
		return shim.Error("Expected three arguments for new Request")
	}

	var transaction Transaction
	var request Request
	var indexItem IndexItem
	var index []IndexItem
	var date = time.Now()

	var programid = args[0]
	var status = args[1]
	var transactionString = args[2]

	fmt.Println(programid)
	fmt.Println(date)
	fmt.Println(status)

	indexbytes, err := APIstub.GetState("index")
	if err != nil {
		return shim.Error("error")
	}

	requestbytes, err := APIstub.GetState(programid)
	if err != nil {
		return shim.Error("error")
	}

	//unmarshalling index obj
	err = json.Unmarshal(indexbytes, &index)
	if err != nil {
		fmt.Println("unable to unmarshal transaction data")
		return shim.Error("error")
	}

	//unmarchalling request Object
	err = json.Unmarshal(requestbytes, &request)
	if err != nil {
		fmt.Println("unable to unmarshal transaction data")
		return shim.Error("unable to unmarshal transaction data")
	}

	transactionmap := make(map[string]string)
	err = json.Unmarshal([]byte(transactionString), &transactionmap)
	if err != nil {
		fmt.Println("Could not marshal index object", err)
		return shim.Error("error unmarshalling the map")
	}
	transaction.TrnsactionDetails = transactionmap
	request.Transactionlist = append(request.Transactionlist, transaction)

	//creating a indexitem obj
	indexItem.Programid = programid
	indexItem.Date = date
	indexItem.Status = status

	for i := 0; i < len(index); i++ {
		if index[i].Programid ==  programid{
			index[i] = indexItem
		}
	}

	jsonAsBytes, errindex := json.Marshal(index)
	if errindex != nil {
		fmt.Println("Could not marshal index object", errindex)
		return shim.Error("error")
	}
	err = APIstub.PutState("index", jsonAsBytes)
	if err != nil {
		fmt.Println("Could not save updated index ", err)
		return shim.Error("error")
	}

	//putting request object
	jsonAsBytes, err = json.Marshal(request)
	if err != nil {
		fmt.Println("Could not marshal request object", err)
		return shim.Error("error")
	}
	err = APIstub.PutState(programid, jsonAsBytes)
	if err != nil {
		fmt.Println("Could not save updated request ", err)
		return shim.Error("error")
	}

	fmt.Println("Successfully stored the request")
	return shim.Success(nil)

}

//3. readRequest    (#user) Query
func (t *SimpleChaincode) readIndex(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	// querying the request
	//var index []IndexItem
	indexAsBytes, _ := APIstub.GetState("index")
	//json.Unmarshal(reqAsBytes, &index)
	return shim.Success(indexAsBytes)
}

//4.readtransactionList  (#user) Query
func (t *SimpleChaincode) readRequest(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	// querying the request
	//var request Request
	fmt.Println("Reading the request data for ", args[0])
	reqAsBytes, _ := APIstub.GetState(args[0])
	//json.Unmarshal(reqAsBytes, &request)
	return shim.Success(reqAsBytes)
}

func makeTimestamp() string {
	t := time.Now()

	return t.Format(("2006-01-02T15:04:05.999999-07:00"))
	//return time.Now().UnixNano() / (int64(time.Millisecond)/int64(time.Nanosecond))
}

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
