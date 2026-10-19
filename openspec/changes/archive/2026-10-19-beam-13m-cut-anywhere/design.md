## Decisions

- `stock.b100 = { len: 13000, unit: 6500, price: 189 }` — `len` to długość fizyczna (najdłuższy
  kawałek bez łączenia), `unit` to jednostka sprzedaży, `price` za jednostkę.
- **Pakowanie:** rozkrój zawsze na belkach 13 m (FFD + losowane best-fit), ale kryterium wyboru
  to liczba połówek: Σ ⌈użyte / 6500⌉, przy remisie bardziej skupiona reszta. Połówki liczą się
  wyłącznie w zestawieniu i koszcie; rysunek rozkroju pokazuje belki 13 m z dopiskiem, gdy
  z belki wystarczy kupić połowę.
- Reszta z belki liczona jak dotąd (minus rzaz), ale od długości kupionej (6,5 albo 13 m).
- Migracja: zapisane `len: 6500` bez `unit` → `len: 13000, unit: 6500`.
