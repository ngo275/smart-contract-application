pragma solidity ^0.4.24;

contract EventContract {

  address public owner;
  string public name;
  string public place;
  uint public date;
  uint public capacity;
  uint public fee;
  bool public isPublished;
  mapping (address => uint) public applications;
  address[] public applicationsArray;

  event Apply(address indexed _user);
  event Cancel(address indexed _user);

  constructor(
    address _owner,
    string _name,
    string _place,
    uint _date,
    uint _capacity,
    uint _fee,
    bool _isPublished
  ) public {
    owner = _owner;
    name = _name;
    place = _place;
    date = _date;
    capacity = _capacity;
    fee = _fee;
    isPublished = _isPublished;
  }

  modifier onlyBeforeStart {
    require(block.timestamp < date, "This event has already started.");
    _;
  }

  modifier onlyAfterStart {
    require(block.timestamp > date, "This event has not started yet.");
    _;
  }

  modifier onlyOwner {
    require(msg.sender == owner, "This is admin method.");
    _;
  }

  function () public payable {
    apply();
  }

  function numberOfApplicants() public view returns (uint8) {
    uint8 count;
    for (uint i = 0; i < applicationsArray.length; i++) {
      if (applicationsArray[i] != address(0)) {
        count++;
      }
    }
    return count;
  }

  function isApplied(address _user) public view returns (bool) {
    bool _isApplied = false;
    for (uint i = 0; i < applicationsArray.length; i++) {
      if (applicationsArray[i] == _user) {
        _isApplied = true;
        break;
      }
    }
    return _isApplied;
  }

  function getInformation(address _user) public view returns (
    string _name,
    string _place,
    uint _date,
    uint _capacity,
    uint _fee,
    bool _isPublished,
    uint _numberOfApplicants,
    bool _isApplied,
    bool _isOwner
  ) {
    _name = name;
    _place = place;
    _date = date;
    _capacity = capacity;
    _fee = fee;
    _isPublished = isPublished;
    _numberOfApplicants = numberOfApplicants();
    _isApplied = isApplied(_user);
    _isOwner = owner == _user;
  }

  function apply() public onlyBeforeStart payable {
    require(msg.value >= fee, "Fee should be larger than mininum fee.");
    require(isPublished == true, "This event is not published yet.");
    if (!isApplied(msg.sender)) {
      require(numberOfApplicants() < capacity, "This event is full.");
      applicationsArray.push(msg.sender);
    }
    applications[msg.sender] = applications[msg.sender] + msg.value;

    emit Apply(msg.sender);
  }

  function cancel() public onlyBeforeStart {
    if (!isApplied(msg.sender)) return;

    uint len = applicationsArray.length;
    for (uint i = 0; i < len; i++) {
      if (applicationsArray[i] == msg.sender) {
        applicationsArray[i] = address(0);
        break;
      }
    }

    // if this event is not for free, then owner should refund fee.
    if (fee > 0) {
      uint refundValue = applications[msg.sender];
      applications[msg.sender] = 0;
      msg.sender.transfer(refundValue);
    }

    emit Cancel(msg.sender);
  }

  function publish() public onlyOwner onlyBeforeStart {
    isPublished = true;
  }

  function withdraw() public onlyOwner onlyAfterStart {
    uint256 amount = 0;
    for (uint i = 0; i < applicationsArray.length; i++) {
      if (applicationsArray[i] != address(0)) {
        amount += applications[applicationsArray[i]];
      }
    }
    owner.transfer(amount);
  }
}
