package routes

import (
	"backend/database"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// GetUsers godoc
// @Summary      Get all users
// @Description  Retrieves all users from the database.
// @Tags         Users
// @Produce      json
// @Success      200  {array}   database.User "List of users"
// @Failure      500  {object}  map[string]string "Error retrieving users"
// @Router       /users [get]
func GetUsers(c *fiber.Ctx) error {
	fmt.Println("GetUsers API called")

	var users []database.User
	result := database.DB.Select("user_id, user_name, user_email, user_role, user_created_at").Find(&users)
	if result.Error != nil {
		fmt.Println("Error fetching users:", result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(map[string]string{
			"error": "Error retrieving users",
		})
	}

	return c.JSON(users)
}

// CreateUser godoc
// @Summary      Create a new user
// @Description  Create a new user with the required fields, including password hashing.
// @Tags         Users
// @Accept       json
// @Produce      json
// @Param        user  body      database.User  true  "User data"
// @Success      200   {object}  database.User  "User successfully added"
// @Failure      400   {object}  map[string]string "Invalid request: Unable to parse JSON or missing required fields"
// @Failure      500   {object}  map[string]string "Error processing password or saving user to database"
// @Router       /users/create [post]
func CreateUser(c *fiber.Ctx) error {
	fmt.Println("CreateUser API called")

	var user database.User
	if err := c.BodyParser(&user); err != nil {
		fmt.Println("Error parsing request body:", err)
		return c.Status(fiber.StatusBadRequest).JSON(map[string]string{
			"error": "Invalid request: Unable to parse JSON",
		})
	}

	fmt.Printf("Decoded user: %+v\n", user)
	if user.UserName == "" || user.UserEmail == "" || user.UserRole == "" || user.UserPassword == "" {
		fmt.Println("Error: Missing required user fields")
		return c.Status(fiber.StatusBadRequest).JSON(map[string]string{
			"error": "Missing required fields: name, email, role, or password",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.UserPassword), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Error hashing password:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(map[string]string{
			"error": "Error processing password",
		})
	}
	user.UserPassword = string(hashedPassword)

	result := database.DB.Create(&user)
	if result.Error != nil {
		fmt.Println("Error saving user to database:", result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(map[string]string{
			"error": "Error saving user to database",
		})
	}

	// Clear password before sending the response
	user.UserPassword = ""
	fmt.Println("User successfully added:", user)
	return c.JSON(user)
}
