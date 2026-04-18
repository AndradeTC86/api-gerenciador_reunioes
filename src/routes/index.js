const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole    = require('../middlewares/roleMiddleware');
const authCtrl       = require('../controllers/authController');
const roomCtrl       = require('../controllers/roomController');
const schedCtrl      = require('../controllers/schedulingController');

const router = Router();

// ── Autenticação ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica um funcionário e retorna JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Token JWT gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email e senha são obrigatórios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email e senha são obrigatórios."
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Credenciais inválidas."
 */
router.post('/login', authCtrl.login);

// ── Salas ─────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /salas:
 *   get:
 *     summary: Lista todas as salas
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de salas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token não fornecido."
 */
router.get('/salas', authMiddleware, roomCtrl.listRooms);

/**
 * @swagger
 * /criarSala:
 *   post:
 *     summary: Cria uma nova sala (Admin)
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoomInput'
 *     responses:
 *       201:
 *         description: Sala criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Nome, capacidade e localização são obrigatórios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Nome, capacidade e localização são obrigatórios."
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token não fornecido."
 *       403:
 *         description: Sem permissão para criar salas (apenas admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Sem permissão para esta ação."
 */
router.post('/criarSala', authMiddleware, requireRole('admin'), roomCtrl.createRoom);

/**
 * @swagger
 * /apagarSala/{id}:
 *   delete:
 *     summary: Remove uma sala (Admin)
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da sala
 *     responses:
 *       200:
 *         description: Sala deletada com sucesso
 *       400:
 *         description: Sala possui agendamentos vinculados e não pode ser deletada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Sala possui agendamentos vinculados e não pode ser deletada."
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token não fornecido."
 *       403:
 *         description: Sem permissão para deletar salas (apenas admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Sem permissão para esta ação."
 *       404:
 *         description: Sala não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Sala não encontrada."
 */
router.delete('/apagarSala/:id', authMiddleware, requireRole('admin'), roomCtrl.deleteRoom);

// ── Agendamentos ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /agenda:
 *   get:
 *     summary: Lista todos os agendamentos
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token não fornecido."
 */
router.get('/agenda', authMiddleware, schedCtrl.getSchedules);

/**
 * @swagger
 * /agenda/{id}:
 *   get:
 *     summary: Lista agendamentos de uma sala específica
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da sala
 *     responses:
 *       200:
 *         description: Agendamentos da sala
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token não fornecido."
 */
router.get('/agenda/:id', authMiddleware, schedCtrl.getSchedulesByRoom);

/**
 * @swagger
 * /reservarSala:
 *   post:
 *     summary: Cria um novo agendamento de sala
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInput'
 *     responses:
 *       201:
 *         description: Agendamento criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Campos obrigatórios ausentes ou dados inválidos (verifique formato de datas, horário futuro, duração máx 8h, antecedência máx 90 dias)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "roomId, start, end e title são obrigatórios."
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token não fornecido."
 *       404:
 *         description: Sala não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Sala não encontrada."
 *       409:
 *         description: Conflito de horário - sala ou usuário já reservado neste período
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Conflito de horário: sala já reservada neste período."
 */
router.post('/reservarSala', authMiddleware, schedCtrl.reservarSala);

/**
 * @swagger
 * /ajustarAgendamento/{id}:
 *   put:
 *     summary: Atualiza um agendamento existente
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agendamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleUpdateInput'
 *     responses:
 *       200:
 *         description: Agendamento atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: ID obrigatório ou dados inválidos (verifique formato de datas, horário futuro, duração máx 8h, antecedência máx 90 dias)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "ID do agendamento é obrigatório."
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token não fornecido."
 *       403:
 *         description: Você não tem permissão para editar este agendamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Você não tem permissão para editar este agendamento."
 *       404:
 *         description: Agendamento não encontrado ou sala não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Agendamento não encontrado."
 *       409:
 *         description: Conflito de horário - sala já reservada ou funcionário já possui reserva neste período
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Conflito de horário: sala já reservada neste período."
 */
router.put('/ajustarAgendamento/:id', authMiddleware, schedCtrl.ajustarAgendamento);

/**
 * @swagger
 * /deletarAgendamento/{id}:
 *   delete:
 *     summary: Remove um agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agendamento
 *     responses:
 *       200:
 *         description: Agendamento deletado
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token não fornecido."
 *       403:
 *         description: Você não tem permissão para deletar este agendamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Você não tem permissão para deletar este agendamento."
 *       404:
 *         description: Agendamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Agendamento não encontrado."
 */
router.delete('/deletarAgendamento/:id', authMiddleware, schedCtrl.deletarAgendamento);

module.exports = router;
