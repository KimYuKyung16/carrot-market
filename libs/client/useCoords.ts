import { useEffect, useState } from "react";

interface UseCoordState {
  latitude: number | null;
  longitude: number | null;
}

export default function useCoords() {
  const [coords, setCoords] = useState<UseCoordState>({
    latitude: null,
    longitude: null,
  });
  const onSuccess = ({
    coords: { latitude, longitude }, // 위도, 경도
  }: GeolocationPosition) => {
    setCoords({latitude, longitude}); // 위도, 경도 설정
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(onSuccess);
    // getCurrentPosition 현재 위치 가져오는 작업
  }, []);
  return coords;
}
