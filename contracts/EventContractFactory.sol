pragma solidity ^0.4.24;

import "./EventContract.sol";

contract EventContractFactory {

  address owner;
  address[] public events;
  mapping (address => address[]) public myEvents;

  event CreateEvent(
    address indexed _newEvent,
    address indexed _owner,
    string _name,
    string _place,
    uint _date,
    uint _capacity,
    uint _fee,
    bool _isPublished
  );

  constructor() public {
    owner = msg.sender;
  }

  function generate(
    address _owner,
    string _name,
    string _place,
    uint _date,
    uint _capacity,
    uint _fee,
    bool _isPublished
  ) public {
    address newEventAddress = new EventContract(_owner, _name, _place, _date, _capacity, _fee, _isPublished);
    events.push(newEventAddress);
    myEvents[msg.sender].push(newEventAddress);

    emit CreateEvent(newEventAddress, _owner, _name, _place, _date, _capacity, _fee, _isPublished);
  }

  function upcomingEvents() public view returns (address[]) {
    uint count = 0;
    EventContract ec;
    uint len = events.length;
    for (uint i = 0; i < len; i++) {
      ec = EventContract(events[i]);
      if (block.timestamp < ec.date()) {
        count++;
      }
    }
    address[] memory sortedEvents = sort(events);
    address[] memory upcomingAddresses = new address[](count);
    for (uint j = 0; j < count; j++) {
      upcomingAddresses[j] = sortedEvents[len - 1 - j];
    }
    return upcomingAddresses;
  }

  function sort(address[] _events) private view returns (address[]) {
    uint len = _events.length;
    uint i = 0;
    uint j = 0;

    address[] memory sorted = new address[](len);

    for (i = 0; i < len; i++) {
      sorted[i] = _events[i];
    }

    for (i = 1; i < len; i++) {
      address c = sorted[i];

      for (j = i; j > 0 && EventContract(sorted[j-1]).date() > EventContract(c).date(); j--) {
        sorted[j] = sorted[j-1];
      }

      sorted[j] = c;
    }
    return sorted;
  }
}
