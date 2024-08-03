import { useEffect, useState } from "react";
import Button from "./Button";
import Modal from "./Modal";
import "./Table.css";

export default function Table() {
  const ths = ["firstName", "lastName", "age", "gender", "phone", "address"];
  const [users, setUsers] = useState([]);
  const [modals, setModals] = useState(new Map());
  //const [usersDef, setUsersDef] = useState([]);
  const [inputValues, setinputValues] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
  });
  const [selects, setSelects] = useState({
    firstName: "def",
    lastName: "def",
    age: "def",
    gender: "def",
    phone: "def",
    address: "def",
  });
  function getUsers(url) {
    function getAllUsersAndSet() {
      fetch("https://dummyjson.com/users")
        .then((r) => r.json())
        .then((u) => {
          setUsers(u.users);
          let m = new Map();
          u.users.forEach((u) => {
            m.set("button" + u.id, false);
          });
          setModals(m);
        });
    }
    fetch(url)
      .then((r) => {
        if (r.ok) return r.json();
        throw { status: r.status };
      })
      .then((u) => {
        if (u.users.length) {
          setUsers(u.users);
          let m = new Map();
          u.users.forEach((u) => {
            m.set("button" + u.id, false);
          });
          setModals(m);
          return;
        }
        alert("No users with such data");
        throw { status: 204 };
      })
      .catch((err) => {
        if (err.status == 500 || err.status == 204) getAllUsersAndSet(); // get and set all users
      });
  }
  useEffect(() => {
    getUsers("https://dummyjson.com/users");
  }, []);

  function qArg(key, value) {
    return `key=${key}&value=${value}`;
  }

  function handleSearch(inputValues) {
    const url = "https://dummyjson.com/users/filter";
    let vals = Object.fromEntries(
        Object.entries(inputValues).filter(([_, v]) => v)
      ),
      query = [];
    for (let key in vals) {
      if (key == "address") {
        const address = vals[key].trim().split(",");
        if (/\d/.test(address[0])) {
          // введена сначала улица
          query.push(qArg(`${key}.address`, address[0].trim()));
          address[1] && query.push(qArg(`${key}.city`, address[1].trim()));
        } else {
          // введен сначала город
          query.push(qArg(`${key}.city`, address[0].trim()));
          address[1] && query.push(qArg(`${key}.address`, address[1].trim()));
        }
      } else {
        query.push(qArg(key, vals[key].trim()));
      }
    }
    const queryString = query.join("&").replace(/ /g, "%20");
    getUsers(url + "?" + queryString);
  }

  function sortUsers(mode, attr) {
    if (mode == "def") {
      return;
    }
    users.sort((a, b) => {
      if (attr == "age")
        return mode == "asc" ? a[attr] - b[attr] : -1 * (a[attr] - b[attr]);
      else if (attr == "address")
        return mode == "asc"
          ? a[attr].city.localeCompare(b[attr].city)
          : -1 * a[attr].city.localeCompare(b[attr].city);
      else
        return mode == "asc"
          ? a[attr].localeCompare(b[attr])
          : -1 * a[attr].localeCompare(b[attr]);
    });
    setUsers(users);
  }

  return (
    <table>
      <thead>
        <tr>
          {ths.map((th) => (
            <th key={th}>{th}</th>
          ))}
        </tr>
        <tr className="tr-inputs">
          {ths.map((th) => {
            return (
              <th key={"input" + th}>
                <div>
                  <input
                    type="string"
                    value={inputValues[th]}
                    onChange={(e) => {
                      setinputValues((prev) => {
                        let next = {
                          ...prev,
                        };
                        next[th] = e.target.value;
                        return next;
                      });
                    }}
                  />
                </div>
                <select
                  id={"select" + th}
                  value={selects[th]}
                  onChange={(e) => {
                    setSelects((prev) => {
                      let next = {
                        ...prev,
                      };
                      next[th] = e.target.value;
                      sortUsers(next[th], th);
                      return next;
                    });
                  }}
                >
                  <option value="def">Без сортировки</option>
                  <option value="asc">По возрастанию</option>
                  <option value="desc">По убыванию</option>
                </select>
              </th>
            );
          })}
          <th>
            <Button onClick={() => handleSearch(inputValues, setUsers)}>
              search
            </Button>
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          return (
            <tr key={user.id}>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.age}</td>
              <td>{user.gender}</td>
              <td>{user.phone}</td>
              <td>{`${user.address.address}, ${user.address.city}`}</td>
              <Button
                id={"button" + user.id}
                onClick={(e) => {
                  const buttonId = e.target.id;
                  setModals((prev) => {
                    let next = new Map(prev);
                    next.set(buttonId, true);
                    console.log(next);
                    return next;
                  });
                }}
              >
                Подробно
              </Button>
              <Modal open={modals.get("button" + user.id)}>
                <ul>
                  <li>
                    name: {user.firstName} {user.lastName}
                  </li>
                  <li>age: {user.age}</li>
                  <li>
                    address: {user.address.address} {user.address.city}
                  </li>
                  <li>height: {user.height}</li>
                  <li>weight: {user.weight} kg</li>
                  <li>phone: {user.phone}</li>
                  <li>email: {user.email}</li>
                </ul>
                <Button
                  id={"button" + user.id}
                  onClick={(e) => {
                    const buttonId = e.target.id;
                    setModals((prev) => {
                      let next = new Map(prev);
                      next.set(buttonId, false);
                      return next;
                    });
                  }}
                >
                  Close modal
                </Button>
              </Modal>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
