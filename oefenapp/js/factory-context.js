// Gedeelde UML + pseudocode-context voor factory-vragen
const FACTORY_UML = {
  guiAbstract: `classDiagram
    class GUIFactory {
        <<interface>>
        +createButton() Button
        +createCheckbox() Checkbox
    }
    class LinFactory {
        +createButton() LinButton
        +createCheckbox() LinCheckbox
    }
    class MacFactory {
        +createButton() MacButton
        +createCheckbox() MacCheckbox
    }
    class Application {
        -factory GUIFactory
        +Application(factory)
        +run()
    }
    class Button { <<interface>> }
    class Checkbox { <<interface>> }
    class LinButton
    class MacButton
    class LinCheckbox
    class MacCheckbox
    GUIFactory <|.. LinFactory
    GUIFactory <|.. MacFactory
    Application --> GUIFactory
    Button <|.. LinButton
    Button <|.. MacButton
    Checkbox <|.. LinCheckbox
    Checkbox <|.. MacCheckbox`,

  guiWinQuiz: `classDiagram
    class GUIFactory {
        <<interface>>
        +createButton() Button
        +createCheckbox() Checkbox
    }
    class LinFactory {
        +createButton() LinButton
        +createCheckbox() LinCheckbox
    }
    class MacFactory {
        +createButton() MacButton
        +createCheckbox() MacCheckbox
    }
    class WinFactory {
        +createButton() WinButton
        +createCheckbox() WinCheckbox
    }
    class Button { <<interface>> }
    class Checkbox { <<interface>> }
    class LinButton
    class MacButton
    class WinButton
    class LinCheckbox
    class MacCheckbox
    class WinCheckbox
    GUIFactory <|.. LinFactory
    GUIFactory <|.. MacFactory
    Button <|.. LinButton
    Button <|.. MacButton
    Button <|.. WinButton
    Checkbox <|.. LinCheckbox
    Checkbox <|.. MacCheckbox
    Checkbox <|.. WinCheckbox`,

  daoAbstract: `classDiagram
    class DAOFactory {
        <<interface>>
        +createMemberDAO() IMemberDAO
        +createBookDAO() IBookDAO
    }
    class SqlDAOFactory {
        +createMemberDAO() SqlMemberDAO
        +createBookDAO() SqlBookDAO
    }
    class XmlDAOFactory {
        +createMemberDAO() XmlMemberDAO
        +createBookDAO() XmlBookDAO
    }
    class BookManager {
        -factory DAOFactory
        +BookManager(factory)
    }
    DAOFactory <|.. SqlDAOFactory
    DAOFactory <|.. XmlDAOFactory
    BookManager --> DAOFactory`,

  memberDi: `classDiagram
    class IMemberDAO {
        <<interface>>
        +find(id) Member
        +save(member) void
    }
    class SQLMemberDAO
    class MemberManager {
        -dao IMemberDAO
        +MemberManager(dao)
        +getMember(id) Member
    }
    IMemberDAO <|.. SQLMemberDAO
    MemberManager --> IMemberDAO`,
};

const FACTORY_CODE = {
  guiInterface: `interface GUIFactory {
  createButton() : Button
  createCheckbox() : Checkbox
}
// LinFactory, MacFactory en Application bestaan al
// Application(GUIFactory factory)`,

  guiLinMain: `interface GUIFactory {
  createButton() : Button
}
// LinFactory bestaat al
// Application(GUIFactory factory)`,

  daoInterface: `interface DAOFactory {
  createMemberDAO() : IMemberDAO
  createBookDAO() : IBookDAO
}
// BookManager(DAOFactory factory)`,

  memberDi: `interface IMemberDAO {
  find(id) : Member
  save(member) : void
}
// MemberManager(IMemberDAO dao)`,
};
