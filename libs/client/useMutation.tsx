import { useState } from "react"

interface UseMutationState<T> { // T : generic type
  loading: boolean;
  data?: T; // 어떤 값이 들어올지 모르기 때문에 generic로 설정해놓음.
  error?: object;
}
type UseMutationResult<T> = [(data: any) => void, UseMutationState<T>];

// 여기에서 선언된 generic type T는 UseMutationResult, UseMutationState에서 사용되는 T와 같음.
export default function useMutation<T = any>(url: string, method: string): UseMutationResult<T> {
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [data, setData] = useState<undefined | any>(undefined); // 받아올 데이터
  const [error, setError] = useState<undefined | any>(undefined); // 에러

  function mutation(data: any) {
    setLoading(true);
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }) // promise 체이닝: 아래로 이어져서 결과값을 아래로 보내줌.
    .then((response) => response.json().catch(() => {})) // JSON.parse()를 할 필요없이 fetch에서는 json() 메서드를 제공
    .then(setData) //then의  매개변수 값이 setData의 인자로 들어감, setError도 마찬가지 -> response.json()값이 인자로 들어옴.
    .catch(setError)
    .finally(() => setLoading(false)); // 데이터를 가져오는 작업이 끝나면 로딩을 무조건 끝내기
  }

  return [mutation, {loading, data, error}];
}

// const [state, setState] = useState({
//   loading: false,
//   data: undefined,
//   error: undefined,
// })