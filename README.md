*INSTALACJA*
- zainstaluj bazę danych MongoDB
- zainstaluj nodejs
- przejdź w konsoli do głównego katalogu z grą
- wykonaj po kolei polecenia: 'npm install', 'npm update'

domyślna ścieżka folderu przechowującego dane bazy: dysk:\data\db
UWAGA! nie uruchamiaj mongod.exe na serwerze z dostępem do sieci publicznych bez użycia "Secure Mode" i opcji 'auth'. Domyślnie opcje te są wyłączone.

*PRZYGOTOWANIE*
- uruchom serwer MongoDB: <miejsce instalacji mongodb>/bin/mongod.exe
- przejdź w konsoli do głównego katalogu z grą
- uruchom server nodejs wykonując polecenie: 'node server.js'

*URUCHOMIENIE GRY*
- otwórz przeglądarkę
- wpisz w pasek adresu: localhost:3000
- drugi gracz wpisuje w pasek adresu: <adres serwera>:3000
* port 3000 jest domyślnym portem ustalonym w pliku server.js

*ZASADY GRY*
W grze Symmetry znajdują się 3 plansze: gracza, środkowa oraz przeciwnika.
Na początku poziomu na środkowej planszy zostają generowane bloki - zadaniem gracza jest zaznaczenie pól na swojej planszy w odbiciu lustrzanym - bloków znajdujących się symetrycznie względem osi x do środkowej planszy.
Poziom wygrywa osoba, której pierwszej udało się wyznaczyć prawidłowo wszystkie bloki.