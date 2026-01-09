# legacy/hwe

**PHP 8.3 game engine - porting reference**

## OVERVIEW

Original game logic being ported to `packages/logic`. 1071 files. Reference only, no new development.

## STRUCTURE

```
hwe/sammo/
├── ActionItem/     # Item implementations (161 files)
├── Command/General/# General commands (55 files)
├── Command/Nation/ # Nation commands (38 files)
├── Constraint/     # Validation rules (73 files)
├── WarUnitTrigger/ # Combat triggers
└── Scenario/       # Map/scenario builders
```

## WHERE TO LOOK

| Task           | Location                        |
| -------------- | ------------------------------- |
| Command logic  | `sammo/Command/General/che_*`   |
| Constraints    | `sammo/Constraint/Cons*`        |
| Item effects   | `sammo/ActionItem/che_*`        |
| AI behavior    | `sammo/GeneralAI.php` (4293 ln) |

## NAMING CONVENTIONS

| Pattern      | Meaning                    |
| ------------ | -------------------------- |
| `che_*`      | Game entity                |
| `Cons*`      | Constraint                 |
| `j_*.php`    | AJAX endpoint              |
| `func_*.php` | Utility functions          |

## iAction INTERFACE

Items/personalities implement hooks: `onCalcStat`, `onCalcOpposeStat`, `onCalcDomestic`, `getWarPowerMultiplier`, `onArbitraryAction`

## PORTING NOTES

| PHP                      | TS                     |
| ------------------------ | ---------------------- |
| `Json::die([...])`       | tRPC return/throw      |
| `$db->queryFirstRow()`   | Prisma findFirst       |
| `$general->getVar('x')`  | `general.x`            |
| `$rng->nextRange(1,100)` | `rng.nextInt(1, 100)`  |
| `aux` field              | `meta` field           |

## HOTSPOTS

- `GeneralAI.php` (4293 lines) - needs decomposition
- `func_converter.php` - globals, move to services
